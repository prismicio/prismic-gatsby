import * as msw from "msw";
import * as prismicT from "@prismicio/types";

import { resolveURL } from "./resolveURL";

import { PluginOptions } from "../../src";

type CreateCustomTypesAPISharedSlicesMockedRequestConfig = {
	pluginOptions: Pick<
		PluginOptions,
		"repositoryName" | "customTypesApiToken" | "customTypesApiEndpoint"
	>;
	response: prismicT.SharedSliceModel[];
};

export const createCustomTypesAPISharedSlicesMockedRequest = (
	config: CreateCustomTypesAPISharedSlicesMockedRequestConfig,
): msw.RestHandler =>
	msw.rest.get(
		resolveURL(
			config.pluginOptions.customTypesApiEndpoint ||
				"https://customtypes.prismic.io",
			"/slices",
		),
		(req, res, ctx) => {
			const repositoryHeader = req.headers.get("repository");
			const authorizationHeader = req.headers.get("Authorization");

			if (
				repositoryHeader === config.pluginOptions.repositoryName &&
				authorizationHeader ===
					`Bearer ${config.pluginOptions.customTypesApiToken}`
			) {
				return res(ctx.json(config.response));
			} else {
				return res(ctx.status(401));
			}
		},
	);
