import { expect, test, vi } from "vitest";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization } from "../src/gatsby-node";

test("creates types for each slice choice", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.sliceZone({
						choices: {
							abc: ctx.mock.model.slice({
								nonRepeatFields: {
									def: ctx.mock.model.boolean(),
								},
								repeatFields: {
									ghi: ctx.mock.model.boolean(),
								},
							}),
							jkl: ctx.mock.model.slice({
								nonRepeatFields: {
									mno: ctx.mock.model.boolean(),
								},
								repeatFields: {
									pqr: ctx.mock.model.boolean(),
								},
							}),
							baz: ctx.mock.model.sharedSliceChoice(),
						},
					}),
				},
			}),
		],
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "baz",
				variations: [ctx.mock.model.sharedSliceVariation({ id: "qux" })],
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "UNION",
		config: {
			name: "PrismicFooDataBar",
			types: [
				"PrismicFooDataBarAbc",
				"PrismicFooDataBarJkl",
				"PrismicBazSliceQux",
			],
			resolveType: expect.any(Function),
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarAbc",
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
				primary: {
					type: "PrismicFooDataBarAbcPrimary!",
				},
				items: {
					type: "[PrismicFooDataBarAbcItem!]!",
				},
			},
			interfaces: ["PrismicSlice"],
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarAbcPrimary",
			fields: {
				def: {
					type: "Boolean",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarAbcItem",
			fields: {
				ghi: {
					type: "Boolean",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarJkl",
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
				primary: {
					type: "PrismicFooDataBarJklPrimary!",
				},
				items: {
					type: "[PrismicFooDataBarJklItem!]!",
				},
			},
			interfaces: ["PrismicSlice"],
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarJklPrimary",
			fields: {
				mno: {
					type: "Boolean",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarJklItem",
			fields: {
				pqr: {
					type: "Boolean",
					description: expect.any(String),
				},
			},
		},
	});
});

test("transforms field names to be GraphQL compatible by default", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.sliceZone({
						choices: {
							baz: ctx.mock.model.slice({
								nonRepeatFields: {
									["with-dash"]: ctx.mock.model.boolean(),
								},
								repeatFields: {
									["with-dash"]: ctx.mock.model.boolean(),
								},
							}),
						},
					}),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooDataBarBazPrimary",
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
			name: "PrismicFooDataBarBazItem",
			fields: {
				with_dash: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});

test("excludes Slice Zones without choices", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.sliceZone({
						choices: {},
					}),
					baz: ctx.mock.model.keyText(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).not.toHaveBeenCalledWith({
		kind: "UNION",
		config: expect.objectContaining({
			name: "PrismicFooDataBar",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooData",
			fields: {
				baz: expect.objectContaining({
					type: "String",
				}),
			},
		},
	});
});

test("supports custom field name transformer", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.sliceZone({
						choices: {
							baz: ctx.mock.model.slice({
								nonRepeatFields: {
									boolean: ctx.mock.model.boolean(),
								},
								repeatFields: {
									boolean: ctx.mock.model.boolean(),
								},
							}),
						},
					}),
				},
			}),
		],
		transformFieldName: (fieldName: string) => fieldName.toUpperCase(),
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooDataBarBazPrimary",
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
			name: "PrismicFooDataBarBazItem",
			fields: {
				BOOLEAN: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});
