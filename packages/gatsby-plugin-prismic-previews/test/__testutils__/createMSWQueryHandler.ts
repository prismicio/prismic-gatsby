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
	response?:
		| prismic.Query
		| ((
				req: MockedRequest,
				res: ResponseComposition,
				ctx: typeof defaultContext,
		  ) => prismic.Query);
	validator?: (
		req: MockedRequest,
		res: ResponseComposition,
		ctx: typeof defaultContext,
	) => void | Promise<void>;
	fallThrough?: boolean;
};

export const createMSWQueryHandler = (
	args: CreateMSWRepositoryHandlerArgs,
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
			try {
				args.validator(req, res, ctx);
			} catch (error) {
				if (args.fallThrough ?? true) {
					// Try the next handler if this
					// handler's validation fails.
					return;
				} else {
					throw error;
				}
			}
		}

		const response =
			typeof args.response === "function"
				? args.response(req, res, ctx)
				: args.response || args.ctx.mock.api.query();

		return res(ctx.json(response));
	});
};
