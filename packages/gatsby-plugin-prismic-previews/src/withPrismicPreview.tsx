import * as React from 'react'
import * as gatsby from 'gatsby'
import * as prismic from 'ts-prismic'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
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

export interface WithPrismicPreviewProps<
  TStaticData extends UnknownRecord = UnknownRecord
> {
  bootstrapPrismicPreview: UsePrismicPreviewBootstrapFn
  isPrismicPreview: boolean
  prismicPreviewState: UsePrismicPreviewBootstrapState['state']
  prismicPreviewError: UsePrismicPreviewBootstrapState['error']
  prismicPreviewOriginalData: TStaticData
}

type WithPrismicPreviewConfig = UsePrismicPreviewBootstrapConfig & {
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
    IOE.chain((token) =>
      IOE.fromEither(validatePreviewTokenForRepository(repositoryName, token)),
    ),
    IOE.getOrElse(() => IO.of(false as boolean)),
  )

export const withPrismicPreview = <
  TStaticData extends UnknownRecord,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<TProps>,
  repositoryName: string,
  config: WithPrismicPreviewConfig,
): React.ComponentType<TProps & WithPrismicPreviewProps<TStaticData>> => {
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
            bootstrapState.error instanceof Response &&
            bootstrapState.error.status === 401 &&
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
          }

          break
        }
      }
    }, [
      accessToken,
      contextState.pluginOptions.promptForAccessToken,
      bootstrapState.state,
      bootstrapState.error,
    ])

    // // TODO: Replace this with a proper UI in the DOM.
    // // TODO: Have a user-facing button to clear the access token cookie.
    // React.useEffect(() => {
    //   switch (localState) {
    //     case 'PROMPT_FOR_ACCESS_TOKEN':
    //     case 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN': {
    //       const accessToken = prompt(
    //         `Enter Prismic access token for ${repositoryName}`,
    //       )

    //       if (accessToken) {
    //         // Set the access token in the repository's context and retry
    //         // bootstrapping the preview.
    //         setAccessToken(accessToken)
    //         bootstrapPreview()
    //       } else {
    //         setLocalState('DISPLAY_ERROR')
    //       }

    //       break
    //     }

    //     case 'DISPLAY_ERROR': {
    //       console.error(bootstrapState.error)

    //       break
    //     }
    //   }
    // }, [localState, bootstrapPreview, bootstrapState.error, setAccessToken])

    const mergedData = useMergePrismicPreviewData(repositoryName, props.data, {
      mergeStrategy: 'traverseAndReplace',
      skip: config.mergePreviewData,
    })

    return (
      <>
        <WrappedComponent
          {...props}
          data={mergedData.data}
          boostrapPrismicPreview={bootstrapPreview}
          isPrismicPreview={mergedData.isPreview}
          prismicPreviewState={bootstrapState.state}
          prismicPreviewError={bootstrapState.error}
          prismicPreviewSetAccessToken={setAccessToken}
          prismicPreviewOriginalData={props.data}
        />
        {(localState === 'PROMPT_FOR_ACCESS_TOKEN' ||
          (localState === 'DISPLAY_ERROR' &&
            bootstrapState.error?.message)) && (
          <Root>
            {localState === 'PROMPT_FOR_ACCESS_TOKEN' && (
              <ModalAccessToken
                repositoryName={repositoryName}
                afterSubmit={bootstrapPreview}
              />
            )}
            {localState === 'DISPLAY_ERROR' &&
              bootstrapState.error?.message && (
                <ModalError
                  repositoryName={repositoryName}
                  errorMessage={bootstrapState.error.message}
                />
              )}
          </Root>
        )}
      </>
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreview.displayName = `withPrismicPreview(${wrappedComponentName})`

  return WithPrismicPreview
}
