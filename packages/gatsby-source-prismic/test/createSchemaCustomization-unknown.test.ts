import { expect, test, vi } from "vitest";

import { CustomTypeModelFieldType } from "@prismicio/client";
import { createMockFactory } from "@prismicio/mock";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization } from "../src/gatsby-node";

// Do not use this mock factory in tests. Use `ctx.mock` instead.
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType({
	id: "foo",
	fields: {
		bar: {
			type: "unknown" as (typeof CustomTypeModelFieldType)[keyof typeof CustomTypeModelFieldType],
		},
	},
});

test("uses JSON type", async () => {
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
				bar: {
					type: "JSON",
					description: expect.stringContaining("This field's type is unknown"),
				},
			},
		},
	});
});

test("reports the unknown field", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
	});
	const reporterInfoSpy = vi.spyOn(gatsbyNodeArgs.reporter, "info");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(reporterInfoSpy).toHaveBeenCalledWith(
		expect.stringMatching(
			'An unknown field type "unknown" was found at foo.data.bar',
		),
	);
});
