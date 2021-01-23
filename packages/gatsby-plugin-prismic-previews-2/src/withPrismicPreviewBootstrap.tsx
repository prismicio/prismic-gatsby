import * as React from 'react'
import * as gatsby from 'gatsby'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { getComponentDisplayName } from './lib/getComponentDisplayName'

import {
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapFn,
  UsePrismicPreviewBootstrapState,
} from './usePrismicPreviewBootstrap'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { PrismicContextActionType } from './context'
import { UnauthorizedError } from './errors/NotAuthorizedError'
import { setCookie } from './lib/setCookie'
import { sprintf } from './lib/sprintf'
import { COOKIE_ACCESS_TOKEN_NAME } from './constants'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
import { getURLSearchParam } from './lib/getURLSearchParam'

export interface WithPrismicPreviewBootstrapProps {
  resolvePrismicPreview: UsePrismicPreviewBootstrapFn
  prismicPreviewState: UsePrismicPreviewBootstrapState['state']
  prismicPreviewPath: UsePrismicPreviewBootstrapState['path']
  prismicPreviewDocument: UsePrismicPreviewBootstrapState['document']
  prismicPreviewError: UsePrismicPreviewBootstrapState['error']
}

// TODO: The config parameter can be removed if this ends up staying as a never
// record.
type WithPrismicPreviewBootstrapConfig = Record<string, never>

type LocalState =
  | 'IDLE'
  | 'PROMPT_FOR_ACCESS_TOKEN'
  | 'PROMPT_FOR_REPLACEMENT_ACCESS_TOKEN'
  | 'DISPLAY_ERROR'

export const withPrismicPreviewBootstrap = <TProps extends gatsby.PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  repositoryName: string,
  config: WithPrismicPreviewBootstrapConfig,
): React.ComponentType<TProps & WithPrismicPreviewBootstrapProps> => {
  const WithPrismicPreviewBootstrap = (props: TProps): React.ReactElement => {
    const [contextState, contextDispatch] = usePrismicPreviewContext(
      repositoryName,
    )
    const [resolverState, resolvePreview] = usePrismicPreviewBootstrap(
      repositoryName,
      config,
    )
    const [localState, setLocalState] = React.useState<LocalState>('IDLE')

    /**
     * Sets an access token for the repository and, by default, stores it in a
     * cookie for future preview sessions. If a cookie is not stored, the
     * access token is available only for the current preview session.
     *
     * @param accessToken Access token to set for the repository.
     * @param remember Determines if the access token should be stored for future preview sessions.
     */
    const setAccessToken = React.useCallback((
      accessToken: string,
      // eslint-disable-next-line @typescript-eslint/no-inferrable-types
      remember: boolean = true,
    ): void => {
      if (!accessToken) {
        return
      }

      contextDispatch({
        type: PrismicContextActionType.SetAccessToken,
        payload: accessToken,
      })

      if (remember) {
        setCookie(
          sprintf(COOKIE_ACCESS_TOKEN_NAME, repositoryName),
          accessToken,
        )()
      }
    }, [])

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
    }, [])

    // Handle state changes from the preview resolver.
    React.useEffect(() => {
      switch (resolverState.state) {
        case 'RESOLVED': {
          if ((config.shouldAutoRedirect ?? true) && resolverState.path) {
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
            if (contextState.pluginOptions.accessToken) {
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
    }, [resolverState.state, resolverState.error, resolverState.path])

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
    }, [localState])

    return (
      <WrappedComponent
        {...props}
        resolvePrismicPreview={resolvePreview}
        prismicPreviewState={resolverState.state}
        prismicPreviewPath={resolverState.path}
        prismicPreviewDocument={resolverState.document}
        prismicPreviewError={resolverState.error}
        prismicPreviewSetAccessToken={setAccessToken}
      />
    )
  }
  WithPrismicPreviewBootstrap.displayName = `withPrismicPreviewBootstrap(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPrismicPreviewBootstrap
}
