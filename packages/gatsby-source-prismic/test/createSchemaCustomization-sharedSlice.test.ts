import { expect, test, vi } from "vitest";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

test("creates union type containing each variation", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "foo",
				variations: [
					ctx.mock.model.sharedSliceVariation({ id: "bar" }),
					ctx.mock.model.sharedSliceVariation({ id: "baz" }),
				],
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "UNION",
		config: {
			name: "PrismicFooSlice",
			description: expect.any(String),
			types: ["PrismicFooSliceBar", "PrismicFooSliceBaz"],
			resolveType: expect.any(Function),
		},
	});
});

test("union type resolves to correct type", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "foo",
				variations: [
					ctx.mock.model.sharedSliceVariation({ id: "bar" }),
					ctx.mock.model.sharedSliceVariation({ id: "baz" }),
				],
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooSlice");
	const typeResolver = type.config.resolveType;
	const res = typeResolver({ slice_type: "foo", variation: "bar" });

	expect(res).toBe("PrismicFooSliceBar");
});

test("creates type for each variation", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "foo",
				variations: [
					ctx.mock.model.sharedSliceVariation({
						id: "bar",
						primaryFields: {
							abc: ctx.mock.model.boolean(),
						},
					}),
					ctx.mock.model.sharedSliceVariation({
						id: "baz",
						itemsFields: {
							jkl: ctx.mock.model.boolean(),
						},
					}),
				],
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooSliceBar",
			description: expect.any(String),
			fields: {
				id: {
					type: "ID!",
					resolve: expect.any(Function),
				},
				slice_type: {
					type: "String!",
				},
				slice_label: {
					type: "String",
				},
				version: {
					type: "String!",
				},
				variation: {
					type: "String!",
				},
				primary: {
					type: "PrismicFooSliceBarPrimary!",
				},
			},
			interfaces: ["PrismicSlice", "PrismicSharedSlice"],
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooSliceBaz",
			description: expect.any(String),
			fields: {
				id: {
					type: "ID!",
					resolve: expect.any(Function),
				},
				slice_type: {
					type: "String!",
				},
				slice_label: {
					type: "String",
				},
				version: {
					type: "String!",
				},
				variation: {
					type: "String!",
				},
				items: {
					type: "[PrismicFooSliceBazItem!]!",
				},
			},
			interfaces: ["PrismicSlice", "PrismicSharedSlice"],
		},
	});
});

test("transforms data field names to be GraphQL compatible by default", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "foo",
				variations: [
					ctx.mock.model.sharedSliceVariation({
						id: "bar",
						primaryFields: {
							["with-dash"]: ctx.mock.model.boolean(),
						},
						itemsFields: {
							["with-dash"]: ctx.mock.model.boolean(),
						},
					}),
				],
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooSliceBarPrimary",
			fields: {
				with_dash: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooSliceBarItem",
			fields: {
				with_dash: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});

test("supports custom data field name transformer", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "foo",
				variations: [
					ctx.mock.model.sharedSliceVariation({
						id: "bar",
						primaryFields: {
							boolean: ctx.mock.model.boolean(),
						},
						itemsFields: {
							boolean: ctx.mock.model.boolean(),
						},
					}),
				],
			}),
		],
		transformFieldName: (fieldName: string) => fieldName.toUpperCase(),
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooSliceBarPrimary",
			fields: {
				BOOLEAN: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooSliceBarItem",
			fields: {
				BOOLEAN: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});
