import * as React from 'react'
import * as gatsby from 'gatsby'
import * as IOE from 'fp-ts/IOEither'
import { pipe } from 'fp-ts/function'
import { HTTPError } from 'ky'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { isPreviewResolverSession } from './lib/isPreviewResolverSession'
import { userFriendlyError } from './lib/userFriendlyError'

import { PrismicRepositoryConfigs } from './types'
import {
  usePrismicPreviewResolver,
  UsePrismicPreviewResolverFn,
  UsePrismicPreviewResolverState,
} from './usePrismicPreviewResolver'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import {
  SetAccessTokenFn,
  usePrismicPreviewAccessToken,
} from './usePrismicPreviewAccessToken'

import { Root } from './components/Root'
import { ModalAccessToken } from './components/ModalAccessToken'
import { ModalError } from './components/ModalError'
import { ModalLoading } from './components/ModalLoading'

export interface WithPrismicPreviewResolverProps {
  isPrismicPreview: boolean | null
  resolvePrismicPreview: UsePrismicPreviewResolverFn
  prismicPreviewState: UsePrismicPreviewResolverState['state']
  prismicPreviewPath: UsePrismicPreviewResolverState['path']
  prismicPreviewError: UsePrismicPreviewResolverState['error']
  prismicPreviewSetAccessToken: SetAccessTokenFn
}

export type WithPrismicPreviewResolverConfig = {
  autoRedirect?: boolean
  navigate?: typeof gatsby.navigate
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'
  | 'NOT_PREVIEW'

/**
 * A React higher order component (HOC) that wraps a Gatsby page to
 * automatically setup a Prismic preview resolver page. It can automatically
 * redirect an editor to the previewed document's page.
 *
 * @param WrappedComponent The Gatsby page component.
 * @param usePrismicPreviewResolverConfig Configuration determining how the preview session is resolved.
 * @param config Configuration determining how the HOC handes the resolved preview.
 *
 * @returns `WrappedComponent` with automatic Prismic preview resolving.
 */
export const withPrismicPreviewResolver = <TProps extends gatsby.PageProps>(
  WrappedComponent: React.ComponentType<
    TProps & WithPrismicPreviewResolverProps
  >,
  repositoryConfigs: PrismicRepositoryConfigs,
  config: WithPrismicPreviewResolverConfig = {},
): React.ComponentType<TProps> => {
  const WithPrismicPreviewResolver = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext()
    const [resolverState, resolvePreview] =
      usePrismicPreviewResolver(repositoryConfigs)
    const [accessToken, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      contextState.activeRepositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')
    const dismissModal = () => setLocalState('IDLE')

    const navigate = props.navigate
    const isPreview =
      resolverState.state === 'INIT' && localState === 'IDLE'
        ? null
        : resolverState.state !== 'INIT' && localState !== 'NOT_PREVIEW'

    // Begin resolving on page entry if the preview token is for this repository.
    React.useEffect(() => {
      pipe(
        isPreviewResolverSession,
        IOE.fold(
          () => () => setLocalState('NOT_PREVIEW'),
          () => () => resolvePreview(),
        ),
      )()
    }, [resolvePreview])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (resolverState.state) {
        case 'RESOLVED': {
          if ((config.autoRedirect ?? true) && resolverState.path) {
            ;(config.navigate ?? gatsby.navigate)(resolverState.path)
          }

          break
        }

        case 'FAILED': {
          if (
            resolverState.error instanceof HTTPError &&
            resolverState.error.response.status === 401 &&
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
            console.error(resolverState.error)
          }

          break
        }
      }
    }, [
      contextState.activeRepositoryName,
      contextState.pluginOptionsStore,
      navigate,
      accessToken,
      resolverState.state,
      resolverState.error,
      resolverState.path,
    ])

    return (
      <>
        <WrappedComponent
          {...props}
          isPrismicPreview={isPreview}
          resolvePrismicPreview={resolvePreview}
          prismicPreviewState={resolverState.state}
          prismicPreviewPath={resolverState.path}
          prismicPreviewError={resolverState.error}
          prismicPreviewSetAccessToken={setAccessToken}
        />

        {contextState.activeRepositoryName && (
          <Root>
            <ModalLoading
              isOpen={
                localState === 'IDLE' && resolverState.state === 'RESOLVING'
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
                resolvePreview()
              }}
              onDismiss={dismissModal}
            />
            <ModalError
              isOpen={localState === 'DISPLAY_ERROR'}
              repositoryName={contextState.activeRepositoryName}
              errorMessage={
                resolverState.error
                  ? userFriendlyError(resolverState.error).message
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
  WithPrismicPreviewResolver.displayName = `withPrismicPreviewResolver(${wrappedComponentName})`

  return WithPrismicPreviewResolver
}
