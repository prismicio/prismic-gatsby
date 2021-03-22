import * as React from 'react'
import * as gatsby from 'gatsby'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import ky from 'ky'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { validatePreviewRefForRepository } from './lib/validatePreviewRefForRepository'
import { getURLSearchParam } from './lib/getURLSearchParam'

import {
  usePrismicPreviewResolver,
  UsePrismicPreviewResolverConfig,
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
  isPrismicPreview: boolean
  resolvePrismicPreview: UsePrismicPreviewResolverFn
  prismicPreviewState: UsePrismicPreviewResolverState['state']
  prismicPreviewPath: UsePrismicPreviewResolverState['path']
  prismicPreviewError: UsePrismicPreviewResolverState['error']
  prismicPreviewSetAccessToken: SetAccessTokenFn
}

type WithPrismicPreviewResolverConfig = UsePrismicPreviewResolverConfig & {
  autoRedirect?: boolean
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'
  | 'NOT_PREVIEW'

export const withPrismicPreviewResolver = <TProps extends gatsby.PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  repositoryName: string,
  config: WithPrismicPreviewResolverConfig,
): React.ComponentType<TProps & WithPrismicPreviewResolverProps> => {
  const WithPrismicPreviewResolver = (props: TProps): React.ReactElement => {
    const [contextState] = usePrismicPreviewContext(repositoryName)
    const [resolverState, resolvePreview] = usePrismicPreviewResolver(
      repositoryName,
      config,
    )
    const [accessToken, { set: setAccessToken }] = usePrismicPreviewAccessToken(
      repositoryName,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')
    const dismissModal = () => setLocalState('IDLE')

    const isPreview =
      resolverState.state === 'INIT' && localState === 'IDLE'
        ? null
        : resolverState.state !== 'INIT' && localState !== 'NOT_PREVIEW'

    // Begin resolving on page entry if the preview token is for this repository.
    React.useEffect(() => {
      const isValidToken = pipe(
        getURLSearchParam('token'),
        E.fromOption(() => new Error('token URL parameter not present')),
        E.chain((token) =>
          validatePreviewRefForRepository(repositoryName, token),
        ),
        E.getOrElse(() => false),
      )

      if (isValidToken) {
        resolvePreview()
      } else {
        setLocalState('NOT_PREVIEW')
      }
    }, [resolvePreview])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (resolverState.state) {
        case 'RESOLVED': {
          if ((config.autoRedirect ?? true) && resolverState.path) {
            gatsby.navigate(resolverState.path)
          }

          break
        }

        case 'FAILED': {
          if (
            resolverState.error instanceof ky.HTTPError &&
            resolverState.error.response.status === 401 &&
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
            console.error(resolverState.error)
          }

          break
        }
      }
    }, [
      accessToken,
      resolverState.state,
      resolverState.error,
      resolverState.path,
      contextState.pluginOptions.promptForAccessToken,
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

        <Root>
          <ModalLoading
            isOpen={
              localState === 'IDLE' && resolverState.state === 'RESOLVING'
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
              resolvePreview()
            }}
            onDismiss={dismissModal}
          />
          <ModalError
            isOpen={localState === 'DISPLAY_ERROR'}
            repositoryName={repositoryName}
            errorMessage={resolverState.error?.message}
            onDismiss={dismissModal}
          />
        </Root>
      </>
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreviewResolver.displayName = `withPrismicPreviewResolver(${wrappedComponentName})`

  return WithPrismicPreviewResolver
}
