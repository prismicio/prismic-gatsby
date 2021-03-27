import * as React from 'react'
import * as gatsby from 'gatsby'
import * as prismic from 'ts-prismic'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import ky from 'ky'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { validatePreviewRefForRepository } from './lib/validatePreviewRefForRepository'
import { getCookie } from './lib/getCookie'

import { UnknownRecord } from './types'
import {
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapConfig,
  UsePrismicPreviewBootstrapFn,
  UsePrismicPreviewBootstrapState,
} from './usePrismicPreviewBootstrap'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { usePrismicPreviewAccessToken } from './usePrismicPreviewAccessToken'
import { useMergePrismicPreviewData } from './useMergePrismicPreviewData'

import { Root } from './components/Root'
import { ModalAccessToken } from './components/ModalAccessToken'
import { ModalError } from './components/ModalError'
import { ModalLoading } from './components/ModalLoading'

export interface WithPrismicPreviewProps<
  TStaticData extends UnknownRecord = UnknownRecord
> {
  bootstrapPrismicPreview: UsePrismicPreviewBootstrapFn
  isPrismicPreview: boolean | null
  prismicPreviewState: UsePrismicPreviewBootstrapState['state']
  prismicPreviewError: UsePrismicPreviewBootstrapState['error']
  prismicPreviewOriginalData: TStaticData
}

export type WithPrismicPreviewConfig = UsePrismicPreviewBootstrapConfig & {
  mergePreviewData?: boolean
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'

const isValidToken = (repositoryName: string): IO.IO<boolean> =>
  pipe(
    getCookie(prismic.cookie.preview),
    IOE.chain((previewRef) =>
      IOE.fromEither(
        validatePreviewRefForRepository(repositoryName, previewRef),
      ),
    ),
    IOE.getOrElse(() => IO.of(false as boolean)),
  )

export const withPrismicPreview = <
  TStaticData extends UnknownRecord,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<
    TProps & WithPrismicPreviewProps<TStaticData>
  >,
  repositoryName: string,
  config: WithPrismicPreviewConfig,
): React.ComponentType<TProps> => {
  const WithPrismicPreview = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext(repositoryName)
    const [bootstrapState, bootstrapPreview] = usePrismicPreviewBootstrap(
      repositoryName,
      config,
    )
    const [accessToken, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      repositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')
    const dismissModal = () => setLocalState('IDLE')

    const mergedData = useMergePrismicPreviewData(repositoryName, props.data, {
      mergeStrategy: 'traverseAndReplace',
      skip: config.mergePreviewData,
    })

    // Begin bootstrapping on page entry if the preview token is for this
    // repository and we haven't already bootstrapped.
    React.useEffect(() => {
      if (isValidToken(repositoryName)() && !contextState.isBootstrapped) {
        bootstrapPreview()
      }
    }, [bootstrapPreview, contextState.isBootstrapped])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (bootstrapState.state) {
        case 'FAILED': {
          if (
            bootstrapState.error instanceof ky.HTTPError &&
            bootstrapState.error.response.status === 401 &&
            contextState.pluginOptions.promptForAccessToken
          ) {
            // If we encountered a 401 status, we don't have the correct access
            // token, and the plugin is configured to prompt for a token, prompt
            // for the correct token.
            if (accessToken) {
              setLocalState('PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN')
            } else {
              setLocalState('PROMPT_FOR_ACCESS_TOKEN')
            }
          } else {
            // Otherwise, just display the error to the user. This can either be
            // an internal error or an UnauthorizedError (if the plugin is
            // configured to not prompt for the access token or we have the wrong
            // token).
            setLocalState('DISPLAY_ERROR')

            // Show the full error and stack trace in the console.
            console.error(bootstrapState.error)
          }

          break
        }

        default: {
          setLocalState('IDLE')
        }
      }
    }, [
      accessToken,
      contextState.pluginOptions.promptForAccessToken,
      bootstrapState.state,
      bootstrapState.error,
    ])

    return (
      <>
        <WrappedComponent
          {...props}
          data={mergedData.data}
          bootstrapPrismicPreview={bootstrapPreview}
          isPrismicPreview={mergedData.isPreview}
          prismicPreviewState={bootstrapState.state}
          prismicPreviewError={bootstrapState.error}
          prismicPreviewSetAccessToken={setAccessToken}
          prismicPreviewOriginalData={props.data}
        />

        <Root>
          <ModalLoading
            isOpen={
              localState === 'IDLE' && bootstrapState.state === 'BOOTSTRAPPING'
            }
            repositoryName={repositoryName}
            onDismiss={dismissModal}
          />
          <ModalAccessToken
            isOpen={
              localState === 'PROMPT_FOR_ACCESS_TOKEN' ||
              localState === 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
            }
            repositoryName={repositoryName}
            state={
              localState === 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
                ? 'INCORRECT'
                : 'IDLE'
            }
            initialAccessToken={accessToken}
            setAccessToken={setAccessToken}
            afterSubmit={() => {
              dismissModal()
              bootstrapPreview()
            }}
            onDismiss={dismissModal}
          />
          <ModalError
            isOpen={localState === 'DISPLAY_ERROR'}
            repositoryName={repositoryName}
            errorMessage={bootstrapState.error?.message}
            onDismiss={dismissModal}
          />
        </Root>
      </>
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreview.displayName = `withPrismicPreview(${wrappedComponentName})`

  return WithPrismicPreview
}
