import { expect, test, vi } from "vitest";

import { createMockFactory } from "@prismicio/mock";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

// Do not use this mock factory in tests. Use `ctx.mock` instead.
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType({
	id: "foo",
	fields: {
		link: mock.model.link(),
	},
});

test("document contains correct field type", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooData",
			fields: {
				link: {
					type: "PrismicLinkField",
					description: expect.stringMatching("Link"),
					resolve: expect.any(Function),
				},
			},
		},
	});
});

test("resolves field to value when filled", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const resolver = type.config.fields.link.resolve;
	const field = ctx.mock.value.link();
	const res = resolver(
		{
			link: field,
		},
		undefined,
		undefined,
		{
			fieldName: "link",
		},
	);

	expect(res).toBe(field);
});

test("resolves field to null when empty", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const resolver = type.config.fields.link.resolve;

	expect(
		resolver(
			{
				link: null,
			},
			undefined,
			undefined,
			{
				fieldName: "link",
			},
		),
	).toBe(null);
	expect(
		resolver(
			{
				link: ctx.mock.value.link({ state: "empty" }),
			},
			undefined,
			undefined,
			{
				fieldName: "link",
			},
		),
	).toBe(null);
});

test("creates shared types", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "ENUM",
		config: {
			name: "PrismicLinkType",
			description: expect.any(String),
			values: {
				Any: {
					description: expect.any(String),
				},
				Document: {
					description: expect.any(String),
				},
				Media: {
					description: expect.any(String),
				},
				Web: {
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicLinkField",
			description: expect.any(String),
			fields: expect.objectContaining({
				link_type: {
					type: "PrismicLinkType",
					description: expect.any(String),
				},
				isBroken: {
					type: "Boolean",
					description: expect.any(String),
				},
				url: {
					type: "String",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				target: {
					type: "String",
					description: expect.any(String),
				},
				size: {
					type: "Int",
					description: expect.any(String),
				},
				id: {
					type: "ID",
					description: expect.any(String),
				},
				type: {
					type: "String",
					description: expect.any(String),
				},
				tags: {
					type: "[String!]",
					description: expect.any(String),
				},
				lang: {
					type: "String",
					description: expect.any(String),
				},
				slug: {
					type: "String",
					description: expect.any(String),
				},
				uid: {
					type: "String",
					description: expect.any(String),
				},
				document: {
					type: "PrismicAllDocumentTypes",
					description: expect.any(String),
					resolve: expect.any(Function),
					extensions: { link: {} },
				},
				localFile: {
					type: "File",
					description: expect.any(String),
					extensions: { link: {} },
				},
				raw: {
					type: "JSON!",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
			}),
		},
	});
});

test("supports configurable type prefix", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "ENUM",
		config: expect.objectContaining({
			name: "PrismicLinkType",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicPrefixLinkField",
		}),
	});
});

test("document field resolves to linked node ID if link type is Document and document is present", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicLinkField");
	const resolver = type.config.fields.document.resolve;
	const res = resolver({ link_type: "Document", id: "foo", isBroken: false });

	expect(res).toBe("acbd18db4cc2f85cedef654fccc4a4d8");
});

test("document field resolves to null if link type is Document and isBroken is true", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicLinkField");
	const resolver = type.config.fields.document.resolve;
	const res = resolver({ link_type: "Document", id: "foo", isBroken: true });

	expect(res).toBeNull();
});

test("document field resolves to null if link type is not Document", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicLinkField");
	const resolver = type.config.fields.document.resolve;
	const res = resolver({ link_type: "Web", url: "foo" });

	expect(res).toBeNull();
});

test("url field resolves using Link Resolver", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		linkResolver: (doc) => `/${doc.id}`,
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicLinkField");
	const resolver = type.config.fields.url.resolve;
	const res = resolver({ link_type: "Document", id: "foo", isBroken: false });

	expect(res).toBe("/foo");
});

test("description includes path for shouldDownloadFiles", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const fieldType = type.config.fields.link;

	expect(fieldType.description).toEqual(
		expect.stringContaining("foo.data.link"),
	);
});
