import * as React from 'react'
import * as gatsby from 'gatsby'
import * as IOE from 'fp-ts/IOEither'
import { constVoid, pipe } from 'fp-ts/function'
import ky from 'ky'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { isPreviewSession } from './lib/isPreviewSession'
import { userFriendlyError } from './lib/userFriendlyError'

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

export type WithPrismicPreviewConfig = {
  mergePreviewData?: boolean
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'
  | 'NOT_PREVIEW'

export const withPrismicPreview = <
  TStaticData extends UnknownRecord,
  TProps extends gatsby.PageProps<TStaticData>
>(
  WrappedComponent: React.ComponentType<
    TProps & WithPrismicPreviewProps<TStaticData>
  >,
  usePrismicPreviewBootstrapConfig: UsePrismicPreviewBootstrapConfig,
  config: WithPrismicPreviewConfig = {},
): React.ComponentType<TProps> => {
  const WithPrismicPreview = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext()
    const [bootstrapState, bootstrapPreview] = usePrismicPreviewBootstrap(
      usePrismicPreviewBootstrapConfig,
    )
    const [accessToken, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      contextState.activeRepositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')
    const dismissModal = () => setLocalState('IDLE')

    const mergedData = useMergePrismicPreviewData(props.data, {
      mergeStrategy: 'traverseAndReplace',
      skip: config.mergePreviewData,
    })

    // Begin bootstrapping on page entry if a preview token exists and we
    // haven't already bootstrapped.
    React.useEffect(() => {
      pipe(
        isPreviewSession,
        IOE.fold(
          () => () => setLocalState('NOT_PREVIEW'),
          () =>
            pipe(
              contextState.isBootstrapped,
              IOE.fromPredicate(
                (isBootstrapped) => !isBootstrapped,
                () => new Error('Already bootstrapped'),
              ),
              IOE.fold(
                () => constVoid,
                () => () => bootstrapPreview(),
              ),
            ),
        ),
      )()
    }, [bootstrapPreview, contextState.isBootstrapped])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (bootstrapState.state) {
        case 'FAILED': {
          if (
            bootstrapState.error instanceof ky.HTTPError &&
            bootstrapState.error.response.status === 401 &&
            contextState.activeRepositoryName &&
            contextState.pluginOptionsStore[contextState.activeRepositoryName]
              .promptForAccessToken
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
      contextState.activeRepositoryName,
      contextState.pluginOptionsStore,
      accessToken,
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

        {contextState.activeRepositoryName && (
          <Root>
            <ModalLoading
              isOpen={
                localState === 'IDLE' &&
                bootstrapState.state === 'BOOTSTRAPPING'
              }
              repositoryName={contextState.activeRepositoryName}
              onDismiss={dismissModal}
            />
            <ModalAccessToken
              isOpen={
                localState === 'PROMPT_FOR_ACCESS_TOKEN' ||
                localState === 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
              }
              repositoryName={contextState.activeRepositoryName}
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
              repositoryName={contextState.activeRepositoryName}
              errorMessage={
                bootstrapState.error
                  ? userFriendlyError(bootstrapState.error).message
                  : undefined
              }
              onDismiss={dismissModal}
            />
          </Root>
        )}
      </>
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreview.displayName = `withPrismicPreview(${wrappedComponentName})`

  return WithPrismicPreview
}
