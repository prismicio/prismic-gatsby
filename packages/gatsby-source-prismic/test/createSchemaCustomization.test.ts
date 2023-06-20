import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization } from "../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

test("creates types for local models", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
		sharedSliceModels: [ctx.mock.model.sharedSlice({ id: "bar" })],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFoo",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "UNION",
		config: expect.objectContaining({
			name: "PrismicBarSlice",
		}),
	});
});

test("creates types for remote models", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypesApiToken: "foo",
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	const customTypeModel = ctx.mock.model.customType({ id: "foo" });
	const sharedSliceModel = ctx.mock.model.sharedSlice({
		id: "bar",
		variations: [
			ctx.mock.model.sharedSliceVariation({ id: "baz" }),
			ctx.mock.model.sharedSliceVariation({ id: "qux" }),
		],
	});

	server.use(
		rest.get("https://customtypes.prismic.io/customtypes", (req, res, ctx) => {
			if (
				req.headers.get("repository") === pluginOptions.repositoryName &&
				req.headers.get("authorization") ===
					`Bearer ${pluginOptions.customTypesApiToken}`
			) {
				return res(ctx.json([customTypeModel]));
			}
		}),
		rest.get("https://customtypes.prismic.io/slices", (req, res, ctx) => {
			if (
				req.headers.get("repository") === pluginOptions.repositoryName &&
				req.headers.get("authorization") ===
					`Bearer ${pluginOptions.customTypesApiToken}`
			) {
				return res(ctx.json([sharedSliceModel]));
			}
		}),
	);

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFoo",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "UNION",
		config: expect.objectContaining({
			name: "PrismicBarSlice",
			types: ["PrismicBarSliceBaz", "PrismicBarSliceQux"],
		}),
	});
});
