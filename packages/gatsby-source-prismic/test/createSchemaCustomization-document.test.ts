import { expect, test, vi } from "vitest";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

test("contains metadata fields", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFoo",
			description: expect.any(String),
			fields: {
				prismicId: {
					type: "ID!",
					description: expect.any(String),
				},
				alternate_languages: {
					type: "[PrismicAlternateLanguage!]!",
					description: expect.any(String),
				},
				first_publication_date: {
					type: "Date!",
					description: expect.any(String),
					extensions: { dateformat: {} },
				},
				last_publication_date: {
					type: "Date!",
					description: expect.any(String),
					extensions: { dateformat: {} },
				},
				href: {
					type: "String!",
					description: expect.any(String),
				},
				lang: {
					type: "String!",
					description: expect.any(String),
				},
				tags: {
					type: "[String!]!",
					description: expect.any(String),
				},
				type: {
					type: "String!",
					description: expect.any(String),
				},
				url: {
					type: "String",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				raw: {
					type: "JSON!",
					description: expect.any(String),
				},
				_previewable: {
					type: "ID!",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
			},
			interfaces: ["Node"],
			extensions: { infer: false },
		},
	});
});

test("contains uid field if included in the model", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					uid: ctx.mock.model.uid(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFoo",
			fields: expect.objectContaining({
				uid: {
					type: "String!",
					description: expect.any(String),
				},
			}),
		}),
	});
});

test("contains data and dataRaw fields if data fields are included in the model", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					boolean: ctx.mock.model.boolean(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFoo",
			fields: expect.objectContaining({
				data: {
					type: "PrismicFooData!",
					description: expect.any(String),
				},
				dataRaw: {
					type: "JSON!",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
			}),
		}),
	});
});

test("supports configurable type prefix", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicPrefixFoo",
		}),
	});
});

test("url field resolves to Link/Route Resolver value", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
			}),
		],
		linkResolver: (doc) => {
			// Specifically opt-out of using Link Resolver for the
			// document we will check later in the test.
			if (doc.url === "/route-resolver") {
				return null;
			}

			return `/${doc.uid}`;
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFoo");
	const resolver = type.config.fields.url.resolve;

	const document = ctx.mock.value.document({
		model: ctx.mock.model.customType({
			fields: {
				uid: ctx.mock.model.uid(),
			},
		}),
	});
	const documentWithRouteResolver = { ...document, url: "/route-resolver" };

	expect(resolver(document)).toBe(`/${document.uid}`);
	expect(resolver(documentWithRouteResolver)).toBe(
		documentWithRouteResolver.url,
	);
});

test("_previewable resolves to Prismic ID", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFoo");
	const resolver = type.config.fields._previewable.resolve;
	const document = { prismicId: "abc123xyz456" };
	const res = resolver(document);

	expect(res).toBe(document.prismicId);
});

test("dataRaw resolves to unprocessed data", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					boolean: ctx.mock.model.boolean(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFoo");
	const resolver = type.config.fields.dataRaw.resolve;
	const document = { raw: { data: { boolean: "true" } } };
	const res = resolver(document);

	expect(res).toBe(document.raw.data);
});

test("creates shared type for alternate_language", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicAlternateLanguage",
			description: expect.any(String),
			fields: {
				id: {
					type: "ID!",
				},
				uid: {
					type: "String",
				},
				lang: {
					type: "String!",
				},
				type: {
					type: "String!",
				},
				url: {
					type: "String",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				document: {
					type: "PrismicAllDocumentTypes!",
					resolve: expect.any(Function),
					extensions: { link: {} },
				},
				raw: {
					type: "JSON!",
					resolve: expect.any(Function),
				},
			},
		},
	});
});

test("supports configurable type prefix for alternate_language", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicPrefixAlternateLanguage",
		}),
	});
});

test("includes resolved URL in alternate language", async (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
	});
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicAlternateLanguage");
	const resolver = type.config.fields.url.resolve;
	const alternativeLanguageDocument = ctx.mock.value.document({ model });
	const document = {
		alternate_languages: [
			{
				id: alternativeLanguageDocument.id,
				uid: alternativeLanguageDocument.uid,
				lang: alternativeLanguageDocument.lang,
				type: alternativeLanguageDocument.type,
			},
		],
	};
	const graphQLContext = {
		nodeModel: {
			getNodeById: vi.fn().mockReturnValue(alternativeLanguageDocument),
		},
	};
	const res = await resolver(
		document.alternate_languages[0],
		undefined,
		graphQLContext,
	);

	expect(graphQLContext.nodeModel.getNodeById).toHaveBeenCalledWith({
		id: gatsbyNodeArgs.createNodeId(alternativeLanguageDocument.id),
		type: "PrismicFoo",
	});
	expect(res).toBe(alternativeLanguageDocument.url);
});

test("transforms data field names to be GraphQL compatible by default", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					["with-dash"]: ctx.mock.model.boolean(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooData",
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
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					boolean: ctx.mock.model.boolean(),
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
			name: "PrismicFooData",
			fields: {
				BOOLEAN: expect.objectContaining({
					type: "Boolean",
				}),
			},
		}),
	});
});
