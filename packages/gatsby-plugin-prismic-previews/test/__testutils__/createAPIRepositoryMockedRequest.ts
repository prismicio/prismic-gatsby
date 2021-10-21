import * as msw from "msw";
import * as prismicT from "@prismicio/types";

import { isValidAccessToken } from "./isValidAccessToken";

import { PluginOptions } from "../../src";

type CreateAPIRepositoryMockedRequestConfig = {
	pluginOptions: PluginOptions;
	repositoryResponse: prismicT.Repository;
};

export const createAPIRepositoryMockedRequest = (
	config: CreateAPIRepositoryMockedRequestConfig,
): msw.RestHandler =>
	msw.rest.get(config.pluginOptions.apiEndpoint, (req, res, ctx) => {
		if (isValidAccessToken(config.pluginOptions.accessToken, req)) {
			return res(ctx.json(config.repositoryResponse));
		} else {
			return res(
				ctx.status(403),
				ctx.json({
					error: "[MOCK ERROR]",
					oauth_initiate: "oauth_initiate",
					oauth_token: "oauth_token",
				}),
			);
		}
	});
