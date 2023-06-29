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
		richText: mock.model.richText(),
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
				richText: {
					type: "PrismicRichTextField!",
					description: expect.stringMatching("Rich Text"),
				},
			},
		},
	});
});

test("creates shared type", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "SCALAR",
		config: {
			name: "PrismicRichText",
			description: expect.any(String),
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicRichTextField",
			description: expect.any(String),
			fields: {
				text: {
					type: "String",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				html: {
					type: "String",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				richText: {
					type: "PrismicRichText!",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
				// TODO: Remove in next major version.
				raw: {
					type: "PrismicRichText!",
					description: expect.any(String),
					deprecationReason: expect.any(String),
					resolve: expect.any(Function),
				},
			},
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
		kind: "SCALAR",
		config: expect.objectContaining({
			name: "PrismicRichText",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicPrefixRichTextField",
		}),
	});
});

test("text field resolves to plain text", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.text.resolve;
	const res = resolver([{ type: "paragraph", text: "Rich Text", spans: [] }]);

	expect(res).toBe("Rich Text");
});

test("text field resolves to null if field is empty", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.text.resolve;
	const res = resolver([{ type: "paragraph", text: "", spans: [] }]);

	expect(res).toBeNull();
});

test("html field resolves to html", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.html.resolve;
	const res = resolver([{ type: "paragraph", text: "Rich Text", spans: [] }]);

	expect(res).toBe("<p>Rich Text</p>");
});

test("html field resolves to null if field is empty", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.html.resolve;
	const res = resolver([{ type: "paragraph", text: "", spans: [] }]);

	expect(res).toBeNull();
});

test("html field uses HTML Serializer if provided", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		htmlSerializer: () => "htmlSerializer",
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.html.resolve;
	const res = resolver([{ type: "paragraph", text: "Rich Text", spans: [] }]);

	expect(res).toBe("htmlSerializer");
});

test("richText field resolves to Rich Text value", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.richText.resolve;
	const field = [{ type: "paragraph", text: "Rich Text", spans: [] }];
	const res = resolver(field);

	expect(res).toBe(field);
});

// TODO: Remove in next major version.
test("raw field resolves to Rich Text value", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicRichTextField");
	const resolver = type.config.fields.raw.resolve;
	const field = [{ type: "paragraph", text: "Rich Text", spans: [] }];
	const res = resolver(field);

	expect(res).toBe(field);
});
