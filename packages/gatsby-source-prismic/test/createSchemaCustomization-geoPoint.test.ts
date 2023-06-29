import { expect, test, vi } from "vitest";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

test("document contains correct field type", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					geoPoint: ctx.mock.model.geoPoint(),
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
				geoPoint: {
					type: "PrismicGeoPointField",
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
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					geoPoint: ctx.mock.model.geoPoint(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const resolver = type.config.fields.geoPoint.resolve;
	const field = ctx.mock.value.geoPoint();
	const res = resolver(
		{
			geoPoint: field,
		},
		undefined,
		undefined,
		{
			fieldName: "geoPoint",
		},
	);

	expect(res).toBe(field);
});

test("resolves field to null when empty", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			geoPoint: ctx.mock.model.geoPoint(),
		},
	});
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicFooData");
	const resolver = type.config.fields.geoPoint.resolve;

	expect(
		resolver(
			{
				geoPoint: null,
			},
			undefined,
			undefined,
			{ fieldName: "geoPoint" },
		),
	).toBe(null);
	expect(
		resolver(
			{
				geoPoint: {},
			},
			undefined,
			undefined,
			{ fieldName: "geoPoint" },
		),
	).toBe(null);
});

test("creates shared type", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicGeoPointField",
			description: expect.any(String),
			fields: {
				longitude: {
					type: "Float",
					description: expect.any(String),
				},
				latitude: {
					type: "Float",
					description: expect.any(String),
				},
			},
		},
	});
});
