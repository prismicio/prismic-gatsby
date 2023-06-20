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
		contentRelationship: mock.model.contentRelationship(),
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
				contentRelationship: {
					type: "PrismicLinkField",
					description: expect.stringMatching("Content Relationship"),
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
	const resolver = type.config.fields.contentRelationship.resolve;
	const field = ctx.mock.value.contentRelationship();
	const res = resolver(
		{
			contentRelationship: field,
		},
		undefined,
		undefined,
		{
			fieldName: "contentRelationship",
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
	const resolver = type.config.fields.contentRelationship.resolve;

	expect(
		resolver(
			{
				contentRelationship: null,
			},
			undefined,
			undefined,
			{
				fieldName: "contentRelationship",
			},
		),
	).toBe(null);
	expect(
		resolver(
			{
				contentRelationship: ctx.mock.value.contentRelationship({
					state: "empty",
				}),
			},
			undefined,
			undefined,
			{
				fieldName: "contentRelationship",
			},
		),
	).toBe(null);
});
