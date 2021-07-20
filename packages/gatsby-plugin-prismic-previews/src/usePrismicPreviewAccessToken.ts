import * as React from 'react'

import { setCookie } from './lib/setCookie'
import { removeCookie } from './lib/removeCookie'
import { sprintf } from './lib/sprintf'

import { COOKIE_ACCESS_TOKEN_NAME } from './constants'
import { PrismicContextActionType } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type SetAccessTokenFn = (accessToken: string, remember?: boolean) => void

type UsePrismicPreviewAccessTokenActions = {
  set: SetAccessTokenFn
  removeCookie(): void
}

/**
 * React hook that reads and sets a Prismic access token for a repository. This
 * hook can be used for multiple repositories by using it multiple times.
 *
 * @param repositoryName Name of the repository.
 */
export const usePrismicPreviewAccessToken = (
  repositoryName?: string,
): readonly [
  accessToken: string | undefined,
  actions: UsePrismicPreviewAccessTokenActions,
] => {
  const [contextState, contextDispatch] = usePrismicPreviewContext()

  const cookieName = repositoryName
    ? sprintf(COOKIE_ACCESS_TOKEN_NAME, repositoryName)
    : undefined

  /**
   * Sets an access token for the repository and, by default, stores it in a
   * cookie for future preview sessions. If a cookie is not stored, the
   * access token is available only for the current preview session.
   *
   * @param accessToken Access token to set for the repository.
   * @param remember Determines if the access token should be stored for future preview sessions.
   */
  const setAccessToken = React.useCallback(
    (
      accessToken: string,
      // eslint-disable-next-line @typescript-eslint/no-inferrable-types
      remember: boolean = true,
    ): void => {
      if (!repositoryName || !cookieName) {
        throw new Error(
          'A repository name must be provided to the usePrismicPreviewAccessToken hook before using the set function.',
        )
      }

      contextDispatch({
        type: PrismicContextActionType.SetAccessToken,
        payload: { repositoryName, accessToken },
      })

      if (remember) {
        setCookie(cookieName, accessToken)()
      }
    },
    [cookieName, contextDispatch, repositoryName],
  )

  /**
   * Removes the stored access token, if set.
   */
  const removeAccessTokenCookie = React.useCallback(() => {
    if (!cookieName) {
      throw new Error(
        'A repository name must be provided to the usePrismicPreviewAccessToken hook before using the removeCookie function.',
      )
    }

    removeCookie(cookieName)()
  }, [cookieName])

  return React.useMemo(
    () =>
      [
        repositoryName
          ? contextState.pluginOptionsStore[repositoryName]?.accessToken
          : undefined,
        {
          set: setAccessToken,
          removeCookie: removeAccessTokenCookie,
        },
      ] as const,
    [
      repositoryName,
      contextState.pluginOptionsStore,
      setAccessToken,
      removeAccessTokenCookie,
    ],
  )
}
