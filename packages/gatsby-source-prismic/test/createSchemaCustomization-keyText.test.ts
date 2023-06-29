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
		keyText: mock.model.keyText(),
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
				keyText: {
					type: "String",
					description: expect.any(String),
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
	const resolver = type.config.fields.keyText.resolve;
	const field = ctx.mock.value.keyText();
	const res = resolver(
		{
			keyText: field,
		},
		undefined,
		undefined,
		{
			fieldName: "keyText",
		},
	);

	expect(res).toBe(field);
});

test("resolves field to null when empty", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const resolver = type.config.fields.keyText.resolve;

	expect(
		resolver(
			{
				keyText: null,
			},
			undefined,
			undefined,
			{
				fieldName: "keyText",
			},
		),
	).toBe(null);
	expect(
		resolver(
			{
				keyText: "",
			},
			undefined,
			undefined,
			{
				fieldName: "keyText",
			},
		),
	).toBe(null);
});
