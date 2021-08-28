import * as msw from "msw";
import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";

import { getMasterRef } from "./getMasterRef";
import { isValidAccessToken } from "./isValidAccessToken";
import { resolveURL } from "./resolveURL";

import { PluginOptions } from "../../src";

type CreateAPIQueryMockedRequestConfig = {
	pluginOptions: PluginOptions;
	repositoryResponse: prismicT.Repository;
	queryResponse: prismicT.Query;
	searchParams?: Partial<
		Omit<prismic.BuildQueryURLArgs, "predicates"> & {
			q: string;
		}
	>;
};

export const createAPIQueryMockedRequest = (
	config: CreateAPIQueryMockedRequestConfig,
): msw.RestHandler =>
	msw.rest.get(
		resolveURL(config.pluginOptions.apiEndpoint, "./documents/search"),
		(req, res, ctx) => {
			const resolvedSearchParams: prismic.BuildQueryURLArgs = {
				ref: getMasterRef(config.repositoryResponse),
				integrationFieldsRef:
					config.repositoryResponse.integrationFieldsRef ?? undefined,
				pageSize: 100,
				...config.searchParams,
			};

			const searchParamsMatch = Object.keys(resolvedSearchParams).every(
				(key) =>
					req.url.searchParams.get(key) ===
					resolvedSearchParams[
						key as keyof typeof resolvedSearchParams
					]?.toString(),
			);

			if (
				searchParamsMatch &&
				isValidAccessToken(
					config.searchParams?.accessToken ?? config.pluginOptions.accessToken,
					req,
				)
			) {
				return res(ctx.json(config.queryResponse));
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
