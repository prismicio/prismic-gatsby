import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { createMockFactory } from "@prismicio/mock";
import {
	CreateRemoteFileNodeArgs,
	createRemoteFileNode,
} from "gatsby-source-filesystem";
import { setupServer } from "msw/node";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMSWQueryHandler } from "./__testutils__/createMSWQueryHandler";
import { createMSWRepositoryHandler } from "./__testutils__/createMSWRepositoryHandler";
import { createMockSourceNodesGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findPrismicDocumentNode } from "./__testutils__/findPrismicDocumentNode";

import { createSchemaCustomization, sourceNodes } from "../src/gatsby-node";

vi.mock("gatsby-source-filesystem", () => {
	return {
		createRemoteFileNode: vi.fn((args: CreateRemoteFileNodeArgs) => {
			return {
				id: `MOCKED FILE NODE ID FOR: ${args.url}`,
			};
		}),
	};
});

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
	server.resetHandlers();
	vi.mocked(createRemoteFileNode).mockRestore();
});
afterAll(() => server.close());

// Do not use this mock factory in tests. Use `ctx.mock` instead.
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType({
	id: "foo",
	fields: {
		image: mock.model.image(),
	},
});

test("localFile field is null by default", async (ctx) => {
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model })],
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
		const node = findPrismicDocumentNode(createNodeSpy, doc.id);

		expect(node.data.image.localFile).toBe(null);
	}
});

test("downloads local file without auto URL param if shouldDownloadFiles is true", async (ctx) => {
	const document = ctx.mock.value.document({ model });
	document.data.image.url =
		"https://example.com/image.png?auto=format,compress&w=1000";
	const queryResponse = ctx.mock.api.query({
		documents: [document],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
		shouldDownloadFiles: true,
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
		const node = findPrismicDocumentNode(createNodeSpy, doc.id);

		expect(node.data.image.localFile).toBe(
			`MOCKED FILE NODE ID FOR: https://example.com/image.png?w=1000`,
		);
	}
});

test("supports path-specific shouldDownloadFiles", async (ctx) => {
	const document = ctx.mock.value.document({ model });
	document.data.image.url =
		"https://example.com/image.png?auto=format,compress&w=1000";
	const queryResponse = ctx.mock.api.query({
		documents: [document],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
		shouldDownloadFiles: {
			"foo.image": true,
		},
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
		const node = findPrismicDocumentNode(createNodeSpy, doc.id);

		expect(node.data.image.localFile).toBe(
			`MOCKED FILE NODE ID FOR: https://example.com/image.png?w=1000`,
		);
	}
});

test("supports path-specific predicate shouldDownloadFiles", async (ctx) => {
	const document = ctx.mock.value.document({ model });
	document.data.image.url =
		"https://example.com/image.png?auto=format,compress&w=1000";
	const queryResponse = ctx.mock.api.query({
		documents: [document],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [model],
		shouldDownloadFiles: {
			"foo.image": ({ url }) => {
				return (
					url === "https://example.com/image.png?auto=format,compress&w=1000"
				);
			},
		},
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
		const node = findPrismicDocumentNode(createNodeSpy, doc.id);

		expect(node.data.image.localFile).toBe(
			`MOCKED FILE NODE ID FOR: https://example.com/image.png?w=1000`,
		);
	}
});
