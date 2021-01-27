import * as React from 'react'
import * as gatsby from 'gatsby'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { getComponentDisplayName } from './lib/getComponentDisplayName'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
import { getURLSearchParam } from './lib/getURLSearchParam'

import { UnauthorizedError } from './errors/NotAuthorizedError'
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

export interface WithPrismicPreviewResolverProps {
  resolvePrismicPreview: UsePrismicPreviewResolverFn;
  prismicPreviewState: UsePrismicPreviewResolverState['state'];
  prismicPreviewPath: UsePrismicPreviewResolverState['path'];
  prismicPreviewError: UsePrismicPreviewResolverState['error'];
  prismicPreviewSetAccessToken: SetAccessTokenFn;
}

type WithPrismicPreviewResolverConfig = UsePrismicPreviewResolverConfig & {
  autoRedirect?: boolean;
}

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'

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

    // Begin resolving on page entry if the preview token is for this repository.
    React.useEffect(() => {
      const isValidToken = pipe(
        getURLSearchParam('token'),
        E.fromOption(() => new Error('token URL parameter not present')),
        E.chain((token) =>
          validatePreviewTokenForRepository(repositoryName, token),
        ),
        E.getOrElse(() => false),
      )

      if (isValidToken) {
        resolvePreview()
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
            resolverState.error instanceof UnauthorizedError &&
            contextState.pluginOptions.promptForAccessToken
          ) {
            // If we encountered an UnauthorizedError, we don't have the correct
            // access token, and the plugin is configured to prompt for a token,
            // prompt for the correct token.
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
      resolverState.state,
      resolverState.error,
      resolverState.path,
      contextState.pluginOptions.promptForAccessToken,
    ])

    // TODO: Replace this with a proper UI in the DOM.
    // TODO: Have a user-facing button to clear the access token cookie.
    React.useEffect(() => {
      switch (localState) {
        case 'PROMPT_FOR_ACCESS_TOKEN':
        case 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN': {
          const accessToken = prompt(
            `Enter Prismic access token for ${repositoryName}`,
          )

          if (accessToken) {
            // Set the access token in the repository's context and retry
            // resolving the preview.
            setAccessToken(accessToken)
            resolvePreview()
          } else {
            setLocalState('DISPLAY_ERROR')
          }

          break
        }

        case 'DISPLAY_ERROR': {
          console.error(resolverState.error)

          break
        }
      }
    }, [localState, resolvePreview, resolverState.error, setAccessToken])

    return (
      <WrappedComponent
        {...props}
        resolvePrismicPreview={resolvePreview}
        prismicPreviewState={resolverState.state}
        prismicPreviewPath={resolverState.path}
        prismicPreviewError={resolverState.error}
        prismicPreviewSetAccessToken={setAccessToken}
      />
    )
  }

  const wrappedComponentName = getComponentDisplayName(WrappedComponent)
  WithPrismicPreviewResolver.displayName = `withPrismicPreviewResolver(${wrappedComponentName})`

  return WithPrismicPreviewResolver
}
