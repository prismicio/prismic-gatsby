import { expect, test, vi } from "vitest";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization } from "../src/gatsby-node";

test("document contains correct field type", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					group: ctx.mock.model.group(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooData",
			fields: {
				group: {
					type: "[PrismicFooDataGroupItem!]!",
					description: expect.any(String),
				},
			},
		},
	});
});

test("creates type with each field", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.group({
						fields: {
							boolean: ctx.mock.model.boolean(),
							color: ctx.mock.model.color(),
							contentRelationship: ctx.mock.model.contentRelationship(),
							date: ctx.mock.model.date(),
							embed: ctx.mock.model.embed(),
							geoPoint: ctx.mock.model.geoPoint(),
							image: ctx.mock.model.image(),
							integrationFields: ctx.mock.model.integration({
								catalog: "baz",
							}),
							keyText: ctx.mock.model.keyText(),
							link: ctx.mock.model.link(),
							linkToMedia: ctx.mock.model.linkToMedia(),
							number: ctx.mock.model.number(),
							richText: ctx.mock.model.richText(),
							select: ctx.mock.model.select(),
							timestamp: ctx.mock.model.timestamp(),
							title: ctx.mock.model.title(),
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
		config: {
			name: "PrismicFooData",
			fields: {
				bar: {
					type: "[PrismicFooDataBarItem!]!",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooDataBarItem",
			description: expect.any(String),
			fields: {
				boolean: expect.objectContaining({
					type: "Boolean",
				}),
				color: expect.objectContaining({
					type: "String",
				}),
				contentRelationship: expect.objectContaining({
					type: "PrismicLinkField",
				}),
				date: expect.objectContaining({
					type: "Date",
				}),
				embed: expect.objectContaining({
					type: "PrismicEmbedField",
				}),
				geoPoint: expect.objectContaining({
					type: "PrismicGeoPointField",
				}),
				image: expect.objectContaining({
					type: "PrismicImageField",
				}),
				integrationFields: expect.objectContaining({
					type: "PrismicBazIntegrationItem",
				}),
				keyText: expect.objectContaining({
					type: "String",
				}),
				link: expect.objectContaining({
					type: "PrismicLinkField",
				}),
				linkToMedia: expect.objectContaining({
					type: "PrismicLinkField",
				}),
				number: expect.objectContaining({
					type: "Float",
				}),
				richText: expect.objectContaining({
					type: "PrismicRichTextField!",
				}),
				select: expect.objectContaining({
					type: "String",
				}),
				timestamp: expect.objectContaining({
					type: "Date",
				}),
				title: expect.objectContaining({
					type: "PrismicRichTextField!",
				}),
			},
		},
	});
});

test("supports configurable type prefix", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.group(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicPrefixFooData",
			fields: {
				bar: expect.objectContaining({
					type: "[PrismicPrefixFooDataBarItem!]!",
				}),
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicPrefixFooDataBarItem",
			description: expect.any(String),
			fields: {},
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
					group: ctx.mock.model.group({
						fields: {
							["with-dash"]: ctx.mock.model.boolean(),
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
			name: "PrismicFooDataGroupItem",
			fields: {
				with_dash: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});

test("supports custom field name transformer", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					group: ctx.mock.model.group({
						fields: {
							boolean: ctx.mock.model.boolean(),
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
			name: "PrismicFooDataGroupItem",
			fields: {
				BOOLEAN: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});
