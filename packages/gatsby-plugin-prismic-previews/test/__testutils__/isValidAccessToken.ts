import * as msw from "msw";

import { createAuthorizationHeader } from "./createAuthorizationHeader";

export const isValidAccessToken = (
	accessToken: string | undefined,
	req: msw.RestRequest,
): boolean => {
	return typeof accessToken === "string"
		? req.headers.get("Authorization") ===
				createAuthorizationHeader(accessToken)
		: true;
};
