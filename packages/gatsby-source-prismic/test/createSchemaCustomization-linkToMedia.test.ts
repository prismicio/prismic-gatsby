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
		linkToMedia: mock.model.linkToMedia(),
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
				linkToMedia: {
					type: "PrismicLinkField",
					description: expect.stringMatching("Link to Media"),
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
	const resolver = type.config.fields.linkToMedia.resolve;
	const field = ctx.mock.value.linkToMedia();
	const res = resolver(
		{
			linkToMedia: field,
		},
		undefined,
		undefined,
		{
			fieldName: "linkToMedia",
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
	const resolver = type.config.fields.linkToMedia.resolve;

	expect(
		resolver(
			{
				linkToMedia: null,
			},
			undefined,
			undefined,
			{
				fieldName: "linkToMedia",
			},
		),
	).toBe(null);
	expect(
		resolver(
			{
				linkToMedia: ctx.mock.value.linkToMedia({ state: "empty" }),
			},
			undefined,
			undefined,
			{
				fieldName: "linkToMedia",
			},
		),
	).toBe(null);
});

test("description includes path for shouldDownloadFiles", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const fieldType = type.config.fields.linkToMedia;

	expect(fieldType.description).toEqual(
		expect.stringContaining("foo.data.linkToMedia"),
	);
});
