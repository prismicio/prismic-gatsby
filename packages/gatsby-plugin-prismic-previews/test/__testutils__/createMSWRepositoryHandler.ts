import { TestContext } from "vitest";

import * as prismic from "@prismicio/client";
import {
	MockedRequest,
	ResponseComposition,
	RestHandler,
	defaultContext,
	rest,
} from "msw";

import { PluginOptions as ValidatedPluginOptions } from "../../src/types";

type CreateMSWRepositoryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	response?: prismic.Repository;
	validator?: (
		req: MockedRequest,
		res: ResponseComposition,
		ctx: typeof defaultContext,
	) => void | Promise<void>;
};

export const createMSWRepositoryHandler = (
	args: CreateMSWRepositoryHandlerArgs,
): RestHandler => {
	const endpoint =
		args.pluginOptions.apiEndpoint ||
		prismic.getRepositoryEndpoint(args.pluginOptions.repositoryName);

	return rest.get(endpoint, (req, res, ctx) => {
		if (args.validator) {
			args.validator(req, res, ctx);
		}

		const response = args.response || args.ctx.mock.api.repository();

		return res(ctx.json(response));
	});
};
