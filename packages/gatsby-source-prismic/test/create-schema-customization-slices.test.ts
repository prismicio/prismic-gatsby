import test from "ava";
import * as sinon from "sinon";
import * as gatsby from "gatsby";
import * as prismicM from "@prismicio/mock";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

const noop = () => void 0;

test("creates types for each slice choice", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		slices: prismicM.model.sliceZone({
			seed: t.title,
			choices: {
				slice: {
					...prismicM.model.slice({ seed: t.title }),
					"non-repeat": {
						boolean: prismicM.model.boolean({ seed: t.title }),
					},
					repeat: {
						boolean: prismicM.model.boolean({ seed: t.title }),
					},
				},
				sharedSlice: prismicM.model.sharedSliceChoice(),
			},
		}),
	});
	customTypeModel.id = "foo";

	const sharedSliceModel = prismicM.model.sharedSlice({
		seed: t.title,
		variations: [
			{
				...prismicM.model.sharedSliceVariation({ seed: t.title }),
				id: "variation1",
				primary: {
					boolean: prismicM.model.boolean({ seed: t.title }),
				},
				items: {
					boolean: prismicM.model.boolean({ seed: t.title }),
				},
			},
			{
				...prismicM.model.sharedSliceVariation({ seed: t.title }),
				id: "variation2",
				primary: {
					boolean: prismicM.model.boolean({ seed: t.title }),
				},
				items: {
					boolean: prismicM.model.boolean({ seed: t.title }),
				},
			},
		],
	});
	sharedSliceModel.id = "sharedSlice";

	pluginOptions.customTypeModels = [customTypeModel];
	pluginOptions.sharedSliceModels = [sharedSliceModel];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "UNION",
			config: sinon.match({
				name: "PrismicPrefixFooDataSlicesSlicesType",
				types: [
					"PrismicPrefixFooDataSlicesSlice",
					"PrismicPrefixSharedSliceVariation1",
					"PrismicPrefixSharedSliceVariation2",
				],
				resolveType: sinon.match.func,
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixFooDataSlicesSlice",
				fields: {
					items: "[PrismicPrefixFooDataSlicesSliceItem!]!",
					primary: "PrismicPrefixFooDataSlicesSlicePrimary!",
					slice_type: "String!",
					slice_label: "String",
					id: sinon.match({
						type: "ID!",
						resolve: sinon.match.func,
					}),
				},
				interfaces: ["PrismicSliceType"],
				extensions: { infer: false },
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixFooDataSlicesSlicePrimary",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixFooDataSlicesSliceItem",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "UNION",
			config: sinon.match({
				name: "PrismicPrefixSharedSlice",
				types: [
					"PrismicPrefixSharedSliceVariation1",
					"PrismicPrefixSharedSliceVariation2",
				],
				resolveType: sinon.match.func,
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation1",
				fields: {
					items: "[PrismicPrefixSharedSliceVariation1Item!]!",
					primary: "PrismicPrefixSharedSliceVariation1Primary!",
					slice_type: "String!",
					slice_label: "String",
					variation: "String!",
					version: "String!",
					id: sinon.match({
						type: "ID!",
						resolve: sinon.match.func,
					}),
				},
				interfaces: ["PrismicSliceType", "PrismicSharedSliceType"],
				extensions: { infer: false },
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation1Item",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation1Primary",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation2",
				fields: {
					items: "[PrismicPrefixSharedSliceVariation2Item!]!",
					primary: "PrismicPrefixSharedSliceVariation2Primary!",
					slice_type: "String!",
					slice_label: "String",
					variation: "String!",
					id: sinon.match({
						type: "ID!",
						resolve: sinon.match.func,
					}),
				},
				interfaces: ["PrismicSliceType", "PrismicSharedSliceType"],
				extensions: { infer: false },
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation2Item",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixSharedSliceVariation2Primary",
				fields: {
					boolean: "Boolean",
				},
			}),
		}),
	);
});

test("slice zones with no slices are excluded from the custom type", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		// Including an extra field so we have something to check for in the test.
		keyText: prismicM.model.keyText({ seed: t.title }),
		// This field should not be included in the Custom Type's type.
		slices: prismicM.model.sliceZone({
			seed: t.title,
			choices: {},
		}),
	});
	customTypeModel.id = "foo";

	pluginOptions.customTypeModels = [customTypeModel];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: {
				name: "PrismicPrefixFooDataType",
				fields: {
					keyText: "String",
				},
			},
		}),
		"The `slices` Slice Zone should not be included",
	);
});

test("id field resolves to a unique id", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const sliceModel = prismicM.model.slice({ seed: t.title });
	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		slices: prismicM.model.sliceZone({
			seed: t.title,
			choices: {
				slice: sliceModel,
			},
		}),
	});
	customTypeModel.id = "foo";

	pluginOptions.customTypeModels = [customTypeModel];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	const call = findCreateTypesCall(
		"PrismicPrefixFooDataSlicesSlice",
		gatsbyContext.actions.createTypes as sinon.SinonStub,
	);
	const field = prismicM.value.slice({
		seed: t.title,
		model: sliceModel,
	});
	const resolver = call.config.fields.id.resolve;
	const res = await resolver(field);

	t.true(res === "Prismic prefix foo data slices slice createContentDigest");
});

test("shared slice union type resolves to correct", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		slices: prismicM.model.sliceZone({
			seed: t.title,
			choices: {
				sharedSlice: prismicM.model.sharedSliceChoice(),
			},
		}),
	});
	customTypeModel.id = "foo";

	const sharedSliceModel = prismicM.model.sharedSlice({
		seed: t.title,
		variationsCount: 2,
	});
	sharedSliceModel.id = "sharedSlice";
	sharedSliceModel.variations[0].id = "variation1";
	sharedSliceModel.variations[1].id = "variation2";

	pluginOptions.customTypeModels = [customTypeModel];
	pluginOptions.sharedSliceModels = [sharedSliceModel];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "UNION",
			config: sinon.match({
				name: "PrismicPrefixSharedSlice",
				types: [
					"PrismicPrefixSharedSliceVariation1",
					"PrismicPrefixSharedSliceVariation2",
				],
				resolveType: sinon.match.func,
			}),
		}),
	);

	const call = findCreateTypesCall(
		"PrismicPrefixSharedSlice",
		gatsbyContext.actions.createTypes as sinon.SinonStub,
	);
	const resolver = call.config.resolveType;

	const sliceVariation1 = prismicM.value.sharedSliceVariation({
		seed: t.title,
		model: sharedSliceModel.variations[0],
		type: sharedSliceModel.id,
	});
	const sliceVariation2 = prismicM.value.sharedSliceVariation({
		seed: t.title,
		model: sharedSliceModel.variations[1],
		type: sharedSliceModel.id,
	});

	t.is(resolver(sliceVariation1), "PrismicPrefixSharedSliceVariation1");
	t.is(resolver(sliceVariation2), "PrismicPrefixSharedSliceVariation2");
});
