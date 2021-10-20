import * as msw from "msw";
import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";

import { isValidAccessToken } from "./isValidAccessToken";

import { UnpreparedPluginOptions } from "../../src";

type CreateAPIRepositoryMockedRequestConfig = {
	pluginOptions: Pick<
		UnpreparedPluginOptions,
		"apiEndpoint" | "repositoryName" | "accessToken"
	>;
	repositoryResponse: prismicT.Repository;
};

export const createAPIRepositoryMockedRequest = (
	config: CreateAPIRepositoryMockedRequestConfig,
): msw.RestHandler =>
	msw.rest.get(
		config.pluginOptions.apiEndpoint ||
			prismic.getEndpoint(config.pluginOptions.repositoryName),
		(req, res, ctx) => {
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
		},
	);
