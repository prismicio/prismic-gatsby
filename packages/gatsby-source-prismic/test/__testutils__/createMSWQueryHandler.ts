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

type CreateMwsRepositoryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	response?: prismic.Query;
	validator?: (
		req: MockedRequest,
		res: ResponseComposition,
		ctx: typeof defaultContext,
	) => void | Promise<void>;
};

export const createMSWQueryHandler = (
	args: CreateMwsRepositoryHandlerArgs,
): RestHandler => {
	const repositoryEndpoint =
		args.pluginOptions.apiEndpoint ||
		prismic.getRepositoryEndpoint(args.pluginOptions.repositoryName);
	const queryEndpoint = new URL(
		"documents/search",
		repositoryEndpoint + "/",
	).toString();

	return rest.get(queryEndpoint, (req, res, ctx) => {
		if (args.validator) {
			args.validator(req, res, ctx);
		}

		const response = args.response || args.ctx.mock.api.query();

		return res(ctx.json(response));
	});
};
