import * as prismic from "@prismicio/client";
import { RestHandler, rest } from "msw";

import { PluginOptions as ValidatedPluginOptions } from "../../src/types";

type CreateMwsRepositoryHandlerArgs = {
	pluginOptions: ValidatedPluginOptions;
	response?: prismic.CustomTypeModel[] | prismic.SharedSliceModel[];
};

export const createMSWCustomTypesHandler = (
	args: CreateMwsRepositoryHandlerArgs,
): RestHandler => {
	const endpoint =
		args.pluginOptions.customTypesApiEndpoint ||
		"https://customtypes.prismic.io/customtypes";

	return rest.get(endpoint, (req, res, ctx) => {
		if (
			req.headers.get("repository") === args.pluginOptions.repositoryName &&
			req.headers.get("Authorization") ===
				`Bearer ${args.pluginOptions.customTypesApiToken}`
		) {
			return res(ctx.json(args.response || []));
		}
	});
};
