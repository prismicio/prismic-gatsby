import {
	SpyInstance,
	afterAll,
	afterEach,
	beforeAll,
	expect,
	test,
	vi,
} from "vitest";

import * as gatsby from "gatsby";
import { setupServer } from "msw/node";
import {
	pascalCase as basePascalCase,
	pascalCaseTransformMerge,
} from "pascal-case";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMSWQueryHandler } from "./__testutils__/createMSWQueryHandler";
import { createMSWRepositoryHandler } from "./__testutils__/createMSWRepositoryHandler";
import { createMockSourceNodesGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findPrismicDocumentNode } from "./__testutils__/findPrismicDocumentNode";

import { createSchemaCustomization, sourceNodes } from "../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Converts a string to a Pascal cased string.
 *
 * @param input - String to convert into a Pascal cased string.
 *
 * @returns Pascal cased string version of `input`.
 */
const pascalCase = (...input: (string | undefined)[]): string => {
	return basePascalCase(input.filter(Boolean).join(" "), {
		transform: pascalCaseTransformMerge,
	});
};

type FindPrismicIntegrationFieldsNodeArgs = {
	createNodeSpy: SpyInstance<
		Parameters<gatsby.Actions["createNode"]>,
		ReturnType<gatsby.Actions["createNode"]>
	>;
	catalog: string;
	value: Record<string, unknown> | null;
	gatsbyNodeArgs: gatsby.SourceNodesArgs;
};

const findPrismicIntegrationFieldsNode = ({
	gatsbyNodeArgs,
	createNodeSpy,
	value,
	catalog,
}: FindPrismicIntegrationFieldsNodeArgs): gatsby.NodeInput => {
	if (value === null) {
		throw new Error(
			`Did not find a createNode call. createNode is not called when the value is \`null\``,
		);
	}

	const call = createNodeSpy.mock.calls.find(
		(args) =>
			args[0].internal.type ===
				pascalCase("Prismic", catalog, "IntegrationItem") &&
			args[0].internal.contentDigest ===
				gatsbyNodeArgs.createContentDigest(value),
	);

	if (!call) {
		throw new Error(`Did not find a createNode call for "${value}"`);
	}

	return call[0];
};

test("creates an accompanying PrismicIntegrationFields node containing all properties", async (ctx) => {
	const catalog = "bar";
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			integrationFields: ctx.mock.model.integration({ catalog }),
		},
	});
	const document = ctx.mock.value.document({ model: customTypeModel });
	document.data.integrationFields = { id: "integrationId", foo: "bar" };
	const queryResponse = ctx.mock.api.query({
		documents: [document],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [customTypeModel],
	});
	const createNodeSpy = vi.spyOn(gatsbyNodeArgs.actions, "createNode");

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, response: queryResponse }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);

	for (const doc of queryResponse.results) {
		const integrationFieldsNode = findPrismicIntegrationFieldsNode({
			createNodeSpy,
			catalog,
			value: doc.data.integrationFields,
			gatsbyNodeArgs,
		});

		expect(integrationFieldsNode).toMatchObject(
			expect.objectContaining({
				...doc.data.integrationFields,
				id: expect.any(String),
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				prismicId: doc.data.integrationFields!.id,
			}),
		);
	}
});

test("links to a PrismicIntegrationFields node", async (ctx) => {
	const catalog = "catalog";
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			integrationFields: ctx.mock.model.integration({ catalog }),
		},
	});
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: customTypeModel })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [customTypeModel],
	});
	const createNodeSpy = vi.spyOn(gatsbyNodeArgs.actions, "createNode");

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, response: queryResponse }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);

	for (const doc of queryResponse.results) {
		const docNode = findPrismicDocumentNode(createNodeSpy, doc.id);
		const integrationFieldsNode = findPrismicIntegrationFieldsNode({
			createNodeSpy,
			catalog,
			value: doc.data.integrationFields,
			gatsbyNodeArgs,
		});

		expect(docNode.data.integrationFields).toBe(integrationFieldsNode.id);
	}
});

test("remains null if empty", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			integrationFields: ctx.mock.model.integration(),
		},
	});
	const doc = ctx.mock.value.document({ model: customTypeModel });
	doc.data.integrationFields = ctx.mock.value.integration({
		state: "empty",
	});
	const queryResponse = ctx.mock.api.query({
		documents: [doc],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [customTypeModel],
	});
	const createNodeSpy = vi.spyOn(gatsbyNodeArgs.actions, "createNode");

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, response: queryResponse }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);

	const docNode = findPrismicDocumentNode(createNodeSpy, doc.id);

	expect(docNode.data.integrationFields).toBe(null);
});
