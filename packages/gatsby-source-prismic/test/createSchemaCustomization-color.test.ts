import { expect, test, vi } from "vitest";

import { createMockFactory } from "@prismicio/mock";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization } from "../src/gatsby-node";

// Do not use this mock factory in tests. Use `ctx.mock` instead.
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType({
	id: "foo",
	fields: {
		color: mock.model.color(),
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
				color: {
					type: "String",
					description: expect.any(String),
				},
			},
		},
	});
});
