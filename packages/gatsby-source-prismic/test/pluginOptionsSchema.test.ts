import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

import * as prismic from "@prismicio/client";
import { testPluginOptionsSchema } from "gatsby-plugin-utils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import fetch from "node-fetch";

import { createMSWRepositoryHandler } from "./__testutils__/createMSWRepositoryHandler";

import type { PluginOptions } from "../src";
import { pluginOptionsSchema } from "../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("passes on valid options", async (ctx) => {
	const pluginOptions: PluginOptions = {
		repositoryName: "string",
		accessToken: "string",
		apiEndpoint: "https://example.com",
		linkResolver: (_doc) => "",
		htmlSerializer: {},
		routes: [
			{
				type: "string",
				uid: "uid",
				lang: "lang",
				path: "string",
				resolvers: {
					foo: "string",
				},
			},
		],
		lang: "string",
		graphQuery: "string",
		predicates: "string",
		releaseID: "string",
		typePrefix: "string",
		customTypesApiToken: "string",
		customTypesApiEndpoint: "https://customtypes.example.com",
		schemas: {
			foo: {},
		},
		customTypeModels: [ctx.mock.model.customType()],
		sharedSliceModels: [ctx.mock.model.sharedSlice()],
		imageImgixParams: { sat: -100 },
		imagePlaceholderImgixParams: { blur: 20 },
		transformFieldName: (_field) => "",
		shouldDownloadFiles: true,
		webhookSecret: "string",
		fetch,
	};

	const repositoryResponse = ctx.mock.api.repository();
	const ref = ctx.mock.api.ref();
	ref.id = "string";
	repositoryResponse.refs = [ref];

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
		rest.get(
			new URL(
				"./customtypes",
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				pluginOptions.customTypesApiEndpoint!,
			).toString(),
			(_req, res, ctx) => {
				return res(ctx.json([]));
			},
		),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([]);
	expect(res.isValid).toBe(true);
});

test("fails on missing options", async () => {
	const pluginOptions = {};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"repositoryName" is required',
		'"value" must contain at least one of [customTypesApiToken, customTypeModels, schemas]',
	]);
	expect(res.isValid).toBe(false);
});

test("fails on invalid options", async () => {
	const pluginOptions = {
		repositoryName: Symbol(),
		accessToken: Symbol(),
		apiEndpoint: Symbol(),
		linkResolver: Symbol(),
		htmlSerializer: Symbol(),
		routes: Symbol(),
		lang: Symbol(),
		graphQuery: Symbol(),
		predicates: Symbol(),
		releaseID: Symbol(),
		typePrefix: Symbol(),
		customTypesApiToken: Symbol(),
		customTypesApiEndpoint: Symbol(),
		schemas: Symbol(),
		customTypeModels: Symbol(),
		sharedSliceModels: Symbol(),
		imageImgixParams: Symbol(),
		imagePlaceholderImgixParams: Symbol(),
		transformFieldName: Symbol(),
		shouldDownloadFiles: Symbol(),
		webhookSecret: Symbol(),
		fetch: Symbol(),
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"repositoryName" must be a string',
		'"accessToken" must be a string',
		'"apiEndpoint" must be a string',
		'"routes" must be an array',
		'"linkResolver" must be of type function',
		'"htmlSerializer" must be one of [object]',
		'"lang" must be a string',
		'"graphQuery" must be a string',
		'"predicates" must be one of [string, array]',
		'"releaseID" must be a string',
		'"typePrefix" must be a string',
		'"customTypesApiToken" must be a string',
		'"customTypesApiEndpoint" must be a string',
		'"schemas" must be of type object',
		'"customTypeModels" must be an array',
		'"sharedSliceModels" must be an array',
		'"imageImgixParams" must be of type object',
		'"imagePlaceholderImgixParams" must be of type object',
		'"transformFieldName" must be of type function',
		'"shouldDownloadFiles" must be one of [boolean, object]',
		'"webhookSecret" must be a string',
		'"fetch" must be of type function',
	]);
	expect(res.isValid).toBe(false);
});

test("allows only one of graphQuery or fetchLinks", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
		graphQuery: "string",
		fetchLinks: ["string"],
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
	]);
	expect(res.isValid).toBe(false);
});

test("allows only one of releaseID or releaseLabel", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
		releaseID: "string",
		releaseLabel: "string",
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"value" contains a conflict between optional exclusive peers [releaseID, releaseLabel]',
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the Prismic repository does not exist", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
	};

	server.use(
		rest.get(
			prismic.getRepositoryEndpoint(pluginOptions.repositoryName),
			(_req, res, ctx) => {
				return res(ctx.status(404));
			},
		),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`Could not access the "${pluginOptions.repositoryName}" Prismic repository. Check that the \`repositoryName\` option is correct and try again.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the access token is incorrect", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		accessToken: "accessToken",
		customTypeModels: [],
	};

	server.use(
		rest.get(
			prismic.getRepositoryEndpoint(pluginOptions.repositoryName),
			(_req, res, ctx) => {
				return res(ctx.status(401), ctx.json({}));
			},
		),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`The provided accessToken for the "${pluginOptions.repositoryName}" repository is incorrect. Check that the \`accessToken\` option is correct and try again.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if an access token is not provided but is required for the repository", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
	};

	server.use(
		rest.get(
			prismic.getRepositoryEndpoint(pluginOptions.repositoryName),
			(_req, res, ctx) => {
				return res(ctx.status(401), ctx.json({}));
			},
		),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`An access token is required for the "${pluginOptions.repositoryName}" Prismic repository, but one was not given. Check that the \`accessToken\` option is correct and try again.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the given Release ID does not exist", async (ctx) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
		releaseID: "foo",
	};

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [];

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`A Release with the ID "${pluginOptions.releaseID}" could not be found. Check that the \`releaseID\` option is correct and try again. You may also need to provide an access token to query Releases.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the given Release label does not exist", async (ctx) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypeModels: [],
		releaseLabel: "foo",
	};

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [];

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`A Release with the label "${pluginOptions.releaseLabel}" could not be found. Check that the \`releaseLabel\` option is correct and try again. You may also need to provide an access token to query Releases.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the given Release ID does not exist but we know it is not due to a missing access token", async (ctx) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		accessToken: "accessToken",
		customTypeModels: [],
		releaseID: "foo",
	};

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [];

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`A Release with the ID "${pluginOptions.releaseID}" could not be found. Check that the \`releaseID\` option is correct and try again. Also check that the access token has access to Releases.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the given Release label does not exist but we know it is not due to a missing access token", async (ctx) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		accessToken: "accessToken",
		customTypeModels: [],
		releaseLabel: "foo",
	};

	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [];

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		`A Release with the label "${pluginOptions.releaseLabel}" could not be found. Check that the \`releaseLabel\` option is correct and try again. Also check that the access token has access to Releases.`,
	]);
	expect(res.isValid).toBe(false);
});

test("fails if the Custom Types API token is incorrect", async (ctx) => {
	const pluginOptions = {
		repositoryName: "qwerty",
		customTypesApiToken: "customTypesApiToken",
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		rest.get("https://customtypes.prismic.io/customtypes", (_req, res, ctx) => {
			return res(ctx.status(403), ctx.json({}));
		}),
	);

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		"The provided Custom Types API token is incorrect. Check that the `customTypesApiToken` option is correct and try again.",
	]);
	expect(res.isValid).toBe(false);
});
