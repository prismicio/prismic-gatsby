import * as msw from "msw";
import * as prismicT from "@prismicio/types";

import { PluginOptions } from "../../src";

type CreateCustomTypesAPIMockedRequestConfig = {
	pluginOptions: Pick<
		PluginOptions,
		"repositoryName" | "customTypesApiToken" | "customTypesApiEndpoint"
	>;
	response: prismicT.CustomTypeModel[];
};

export const createCustomTypesAPIMockedRequest = (
	config: CreateCustomTypesAPIMockedRequestConfig,
): msw.RestHandler =>
	msw.rest.get(
		config.pluginOptions.customTypesApiEndpoint ||
			"https://customtypes.prismic.io/customtypes",
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
