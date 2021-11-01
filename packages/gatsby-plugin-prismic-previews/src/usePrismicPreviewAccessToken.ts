import * as React from "react";
import * as cookie from "es-cookie";

import { sprintf } from "./lib/sprintf";

import { COOKIE_ACCESS_TOKEN_NAME } from "./constants";
import { ActionKind } from "./context";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";

type UsePrismicPreviewAccessTokenReturnType = readonly [
	accessToken: string | undefined,
	actions: {
		set: (accessToken: string, remember?: boolean) => void;
		removeCookie(): void;
	},
];

/**
 * React hook that reads and sets a Prismic access token for a repository. This
 * hook can be used for multiple repositories by using it multiple times.
 *
 * @param repositoryName - Name of the repository.
 */
export const usePrismicPreviewAccessToken = (
	repositoryName?: string,
): UsePrismicPreviewAccessTokenReturnType => {
	const [contextState, contextDispatch] = usePrismicPreviewContext();

	const cookieName = repositoryName
		? sprintf(COOKIE_ACCESS_TOKEN_NAME, repositoryName)
		: undefined;

	/**
	 * Sets an access token for the repository and, by default, stores it in a
	 * cookie for future preview sessions. If a cookie is not stored, the access
	 * token is available only for the current preview session.
	 *
	 * @param accessToken - Access token to set for the repository.
	 * @param remember - Determines if the access token should be stored for
	 *   future preview sessions.
	 */
	const setAccessToken = React.useCallback(
		(accessToken: string, remember = true as boolean): void => {
			if (!repositoryName || !cookieName) {
				throw new Error(
					"A repository name must be provided to usePrismicPreviewAccessToken before using the set function.",
				);
			}

			contextDispatch({
				type: ActionKind.SetAccessToken,
				payload: { repositoryName, accessToken },
			});

			if (remember) {
				cookie.set(cookieName, accessToken);
			}
		},
		[cookieName, contextDispatch, repositoryName],
	);

	/**
	 * Removes the stored access token, if set.
	 */
	const removeAccessTokenCookie = React.useCallback(() => {
		if (!cookieName) {
			throw new Error(
				"A repository name must be provided to usePrismicPreviewAccessToken before using the removeCookie function.",
			);
		}

		cookie.remove(cookieName);
	}, [cookieName]);

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
	);
};
