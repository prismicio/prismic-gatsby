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
import { createMockFactory } from "@prismicio/mock";
import { setupServer } from "msw/node";

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

// Do not use this mock factory in tests. Use `ctx.mock` instead.
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType({
	id: "foo",
	fields: {
		embed: mock.model.embed(),
	},
});

const findPrismicEmbedNode = (
	spy: SpyInstance<Parameters<gatsby.Actions["createNode"]>>,
	embedURL: string,
): gatsby.NodeInput => {
	const call = spy.mock.calls.find(
		(args) =>
			args[0].internal.type === "PrismicEmbedField" &&
			args[0].embed_url === embedURL,
	);

	if (!call) {
		throw new Error(`Did not find a createNode call for "${embedURL}"`);
	}

	return call[0];
};

test("creates an accompanying PrismicEmbed node containing all properties", async (ctx) => {
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: model })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
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
		const embedNode = findPrismicEmbedNode(
			createNodeSpy,
			doc.data.embed.embed_url,
		);

		expect(embedNode).toContain(doc.data.embed);
	}
});

test("links to a PrismicEmbed node", async (ctx) => {
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: model })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
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
		const embedNode = findPrismicEmbedNode(
			createNodeSpy,
			doc.data.embed.embed_url,
		);

		expect(docNode.data.embed).toBe(embedNode.id);
	}
});

test("remains null if empty", async (ctx) => {
	const doc = ctx.mock.value.document({ model: model });
	doc.data.embed = ctx.mock.value.embed({ state: "empty" });
	const queryResponse = ctx.mock.api.query({
		documents: [doc],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
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

	expect(docNode.data.embed).toBe(null);
});
