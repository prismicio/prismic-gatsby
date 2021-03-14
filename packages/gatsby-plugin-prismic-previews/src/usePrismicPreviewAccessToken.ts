import * as React from 'react'

import { setCookie } from './lib/setCookie'
import { removeCookie } from './lib/removeCookie'
import { sprintf } from './lib/sprintf'

import { COOKIE_ACCESS_TOKEN_NAME } from './constants'
import { PrismicContextActionType } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type SetAccessTokenFn = (accessToken: string, remember?: boolean) => void

export const usePrismicPreviewAccessToken = (
  repositoryName: string,
): readonly [
  string | undefined,
  {
    set: SetAccessTokenFn
    removeCookie(): void
  },
] => {
  const [contextState, contextDispatch] = usePrismicPreviewContext(
    repositoryName,
  )

  const cookieName = sprintf(COOKIE_ACCESS_TOKEN_NAME, repositoryName)

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
    removeCookie(cookieName)()
  }, [cookieName])

  return React.useMemo(
    () =>
      [
        contextState.pluginOptions.accessToken,
        {
          set: setAccessToken,
          removeCookie: removeAccessTokenCookie,
        },
      ] as const,
    [
      contextState.pluginOptions.accessToken,
      setAccessToken,
      removeAccessTokenCookie,
    ],
  )
}
