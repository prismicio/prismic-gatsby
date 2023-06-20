import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import * as prismic from "@prismicio/client";
import { MockedRequest } from "msw";
import { setupServer } from "msw/node";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMSWQueryHandler } from "./__testutils__/createMSWQueryHandler";
import { createMSWRepositoryHandler } from "./__testutils__/createMSWRepositoryHandler";
import { createMockSourceNodesGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";

import { createSchemaCustomization, sourceNodes } from "../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("creates nodes for sourced documents", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({ id: "foo" });
	const queryResponse = ctx.mock.api.query({
		documents: [
			ctx.mock.value.document({ model: customTypeModel }),
			ctx.mock.value.document({ model: customTypeModel }),
		],
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
		expect(createNodeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				id: expect.any(String),
				prismicId: doc.id,
				raw: doc,
				internal: expect.objectContaining({
					type: "PrismicFoo",
					contentDigest: expect.any(String),
				}),
			}),
		);
	}
});

test("supports typePrefix", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({ id: "foo" });
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: customTypeModel })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
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
		expect(createNodeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				prismicId: doc.id,
				internal: expect.objectContaining({
					type: "PrismicPrefixFoo",
				}),
			}),
		);
	}
});

test("supports access token", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		accessToken: "accessToken",
	});
	const validator = (req: MockedRequest) => {
		const accessToken = req.url.searchParams.get("access_token");
		expect(accessToken).toBe(pluginOptions.accessToken);
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions, validator }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports custom apiEndpoint", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		apiEndpoint: "https://example.com/foo",
	});
	const validator = (req: MockedRequest) => {
		const matcher = new RegExp(`^${pluginOptions.apiEndpoint}`);
		expect(req.url.toString()).toMatch(matcher);
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions, validator }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports routes", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		routes: [{ type: "foo", path: "/:uid" }],
	});
	const validator = (req: MockedRequest) => {
		const routes = req.url.searchParams.get("routes");
		expect(routes).toBe(JSON.stringify(pluginOptions.routes));
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("defaults lang to `*`", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const validator = (req: MockedRequest) => {
		expect(req.url.searchParams.get("lang")).toBe("*");
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports custom lang", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		lang: "foo",
	});
	const validator = (req: MockedRequest) => {
		expect(req.url.searchParams.get("lang")).toBe("foo");
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports fetchLinks", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		fetchLinks: ["foo.bar", "baz.qux"],
	});
	const validator = (req: MockedRequest) => {
		const fetchLinks = req.url.searchParams.get("fetchLinks");
		expect(fetchLinks).toBe(pluginOptions.fetchLinks?.join(","));
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports graphQuery", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		graphQuery: "{ post { title } }",
	});
	const validator = (req: MockedRequest) => {
		const graphQuery = req.url.searchParams.get("graphQuery");
		expect(graphQuery).toBe(pluginOptions.graphQuery);
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports predicates as a string", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		predicates: prismic.predicate.at("document.type", "foo"),
	});
	const validator = (req: MockedRequest) => {
		const predicates = req.url.searchParams.getAll("q");
		expect(predicates).toContain(`[${pluginOptions.predicates}]`);
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports predicates as an array of strings", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		predicates: [
			prismic.predicate.at("document.type", "foo"),
			prismic.predicate.any("document.tags", ["bar"]),
		],
	});
	const validator = (req: MockedRequest) => {
		const predicates = req.url.searchParams.getAll("q");
		for (const predicate of pluginOptions.predicates || []) {
			expect(predicates).toContain(`[${predicate}]`);
		}
	};

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports sourcing from a release by ID", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const ref = ctx.mock.api.ref({ isMasterRef: false });
	const pluginOptions = buildPluginOptionsForTest({
		releaseID: ref.id,
	});
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [...repositoryResponse.refs, ref];

	const validator = (req: MockedRequest) => {
		const urlRef = req.url.searchParams.get("ref");
		expect(urlRef).toBe(ref.ref);
	};

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("supports sourcing from a release by label", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const ref = ctx.mock.api.ref({ isMasterRef: false });
	const pluginOptions = buildPluginOptionsForTest({
		releaseLabel: ref.label,
	});
	const repositoryResponse = ctx.mock.api.repository();
	repositoryResponse.refs = [...repositoryResponse.refs, ref];

	const validator = (req: MockedRequest) => {
		const urlRef = req.url.searchParams.get("ref");
		expect(urlRef).toBe(ref.ref);
	};

	server.use(
		createMSWRepositoryHandler({
			ctx,
			pluginOptions,
			response: repositoryResponse,
		}),
		createMSWQueryHandler({ ctx, pluginOptions, validator }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);
	await sourceNodes(gatsbyNodeArgs, pluginOptions);
});

test("warns if a document's Custom Type model is not provided", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({ id: "foo" });
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: customTypeModel })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const reporterWarnSpy = vi.spyOn(gatsbyNodeArgs.reporter, "warn");

	server.use(
		createMSWRepositoryHandler({ ctx, pluginOptions }),
		createMSWQueryHandler({ ctx, pluginOptions, response: queryResponse }),
	);

	// @ts-expect-error - gatsbyNodeArgs is generated for sourceNodes
	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	await sourceNodes(gatsbyNodeArgs, pluginOptions);

	expect(reporterWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/model was not provided/i),
	);
});

test("transforms field names to be GraphQL compatible by default", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			["with-dash"]: ctx.mock.model.boolean(),
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
		expect(createNodeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				prismicId: doc.id,
				data: {
					with_dash: doc.data["with-dash"],
				},
			}),
		);
	}
});

test("supports custom field name transformer", async (ctx) => {
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			boolean: ctx.mock.model.boolean(),
		},
	});
	const queryResponse = ctx.mock.api.query({
		documents: [ctx.mock.value.document({ model: customTypeModel })],
	});

	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [customTypeModel],
		transformFieldName: (fieldName: string) => fieldName.toUpperCase(),
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
		expect(createNodeSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				prismicId: doc.id,
				data: {
					BOOLEAN: doc.data.boolean,
				},
			}),
		);
	}
});
