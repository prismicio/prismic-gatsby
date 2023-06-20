import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

import { testPluginOptionsSchema } from "gatsby-plugin-utils";
import { setupServer } from "msw/node";

import type { PluginOptions } from "../../src";
import { pluginOptionsSchema } from "../../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("passes on valid options", async () => {
	const pluginOptions: PluginOptions = {
		repositoryName: "string",
		accessToken: "string",
		apiEndpoint: "https://example.com",
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
		typePrefix: "string",
		imageImgixParams: { sat: -100 },
		imagePlaceholderImgixParams: { blur: 20 },
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([]);
	expect(res.isValid).toBe(true);
});

test("fails on missing options", async () => {
	const pluginOptions = {};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual(['"repositoryName" is required']);
	expect(res.isValid).toBe(false);
});

test("fails on invalid options", async () => {
	const pluginOptions = {
		repositoryName: Symbol(),
		accessToken: Symbol(),
		apiEndpoint: Symbol(),
		routes: Symbol(),
		lang: Symbol(),
		graphQuery: Symbol(),
		predicates: Symbol(),
		typePrefix: Symbol(),
		imageImgixParams: Symbol(),
		imagePlaceholderImgixParams: Symbol(),
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"repositoryName" must be a string',
		'"accessToken" must be a string',
		'"apiEndpoint" must be a string',
		'"routes" must be an array',
		'"lang" must be a string',
		'"graphQuery" must be a string',
		'"predicates" must be one of [string, array]',
		'"typePrefix" must be a string',
		'"imageImgixParams" must be of type object',
		'"imagePlaceholderImgixParams" must be of type object',
	]);
	expect(res.isValid).toBe(false);
});

test("allows only one of graphQuery or fetchLinks", async () => {
	const pluginOptions = {
		repositoryName: "qwerty",
		graphQuery: "string",
		fetchLinks: ["string"],
	};

	const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions);

	expect(res.errors).toEqual([
		'"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
	]);
	expect(res.isValid).toBe(false);
});
