import test from "ava";
import * as msw from "msw";
import * as mswn from "msw/node";
import * as prismicM from "@prismicio/mock";
import { testPluginOptionsSchema } from "gatsby-plugin-utils";
import fetch from "node-fetch";

import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createCustomTypesAPIMockedRequest } from "./__testutils__/createCustomTypesAPIMockedRequest";
import { createCustomTypesAPISharedSlicesMockedRequest } from "./__testutils__/createCustomTypesAPISharedSlicesMockedRequest";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { UnpreparedPluginOptions } from "../src";
import { pluginOptionsSchema } from "../src/plugin-options-schema";

const server = mswn.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.afterEach(() => server.resetHandlers());
test.after(() => server.close());

test.serial("passes on valid options", async (t) => {
	const customTypeModel = prismicM.model.customType({ seed: t.title });
	const sharedSliceModel = prismicM.model.sharedSlice({ seed: t.title });
	const releaseRef = prismicM.api.ref({ seed: t.title });

	const pluginOptions: UnpreparedPluginOptions = {
		repositoryName: "string",
		accessToken: "string",
		customTypesApiToken: "string",
		customTypesApiEndpoint: "https://example-custom-types-api-endpoint.com",
		apiEndpoint: "https://example-apiEndpoint.com",
		releaseID: releaseRef.id,
		graphQuery: "string",
		lang: "string",
		linkResolver: (): string => "",
		htmlSerializer: {},
		customTypeModels: [customTypeModel],
		sharedSliceModels: [sharedSliceModel],
		imageImgixParams: { q: 100 },
		imagePlaceholderImgixParams: { q: 100 },
		typePrefix: "string",
		webhookSecret: "string",
		// @ts-expect-error - noop purposely given for test
		createRemoteFileNode: (): void => void 0,
		transformFieldName: (x: string): string => x,
		fetch,
	};

	const repositoryResponse = prismicM.api.repository({
		seed: t.title,
		customTypeModels: [customTypeModel],
	});
	repositoryResponse.refs = [...repositoryResponse.refs, releaseRef];

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
		createCustomTypesAPIMockedRequest({
			pluginOptions,
			response: [],
		}),
		createCustomTypesAPISharedSlicesMockedRequest({
			pluginOptions,
			response: [],
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	t.deepEqual(res.errors, []);
	t.true(res.isValid);
});

test.serial("fails on missing options", async (t) => {
	const pluginOptions = {
		schemas: {},
	};
	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	t.false(res.isValid);
	t.deepEqual(res.errors, ['"repositoryName" is required']);
});

test.serial("fails on invalid options", async (t) => {
	const pluginOptions = {
		repositoryName: Symbol(),
		accessToken: Symbol(),
		customTypesApiToken: Symbol(),
		customTypesApiEndpoint: Symbol(),
		apiEndpoint: Symbol(),
		releaseID: Symbol(),
		graphQuery: Symbol(),
		lang: Symbol(),
		linkResolver: Symbol(),
		htmlSerializer: Symbol(),
		schemas: Symbol(),
		customTypeModels: Symbol(),
		sharedSliceModels: Symbol(),
		imageImgixParams: Symbol(),
		imagePlaceholderImgixParams: Symbol(),
		typePrefix: Symbol(),
		webhookSecret: Symbol(),
		shouldDownloadFiles: Symbol(),
		createRemoteFileNode: Symbol(),
		fetch: Symbol(),
	};
	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	t.false(res.isValid);
	t.deepEqual(res.errors, [
		'"repositoryName" must be a string',
		'"accessToken" must be a string',
		'"apiEndpoint" must be a string',
		'"customTypesApiToken" must be a string',
		'"customTypesApiEndpoint" must be a string',
		'"releaseID" must be a string',
		'"graphQuery" must be a string',
		'"lang" must be a string',
		'"linkResolver" must be of type function',
		'"htmlSerializer" must be one of [object]',
		'"schemas" must be of type object',
		'"customTypeModels" must be an array',
		'"sharedSliceModels" must be an array',
		'"imageImgixParams" must be of type object',
		'"imagePlaceholderImgixParams" must be of type object',
		'"typePrefix" must be a string',
		'"webhookSecret" must be a string',
		'"shouldDownloadFiles" must be of type object',
		'"createRemoteFileNode" must be of type function',
		'"fetch" must be of type function',
	]);
});

test.serial("fails on invalid customTypesApiToken", async (t) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypesApiToken: "customTypesApiToken",
	};
	const repositoryResponse = prismicM.api.repository({ seed: t.title });

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		// Intentionally making a failed 403 response.
		msw.rest.get(
			"https://customtypes.prismic.io/customtypes",
			(_req, res, ctx) => res(ctx.status(403), ctx.json({})),
		),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	t.false(res.isValid);
	t.deepEqual(res.errors, [
		"Unable to access the Prismic Custom Types API. Check the customTypesApiToken option.",
	]);
});

test.serial("allows only one of qraphQuery or fetchLinks", async (t) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [prismicM.model.customType({ seed: t.title })],
		graphQuery: "string",
		fetchLinks: ["string"],
	};
	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	t.false(res.isValid);
	t.deepEqual(res.errors, [
		'"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
	]);
});

test.serial("checks that all schemas are provided", async (t) => {
	const pluginOptions = createPluginOptions(t);
	pluginOptions.customTypeModels = [];
	pluginOptions.customTypesApiToken = undefined;

	const { plugins, ...pluginOptionsWithoutPlugins } = pluginOptions;

	// This line is to ignore tsserver's unused variable wraning.
	plugins;

	const customTypeModel = prismicM.model.customType({ seed: t.title });
	const repositoryResponse = prismicM.api.repository({
		seed: t.title,
		customTypeModels: [customTypeModel],
	});

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions: pluginOptions,
			repositoryResponse,
		}),
	);

	const res = await testPluginOptionsSchema(
		pluginOptionsSchema,
		pluginOptionsWithoutPlugins,
	);

	t.false(res.isValid);
	t.true(res.errors.length === 1);
	t.true(new RegExp(customTypeModel.id).test(res.errors[0]));
});
