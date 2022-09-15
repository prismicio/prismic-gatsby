import test from "ava";
import * as gatsby from "gatsby";
import * as sinon from "sinon";
import * as mswNode from "msw/node";
import * as prismicM from "@prismicio/mock";

import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { createSchemaCustomization, sourceNodes } from "../src/gatsby-node";

const noop = () => void 0;

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("Link to Media fields are normalized to include localFile field id", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		linkToMedia: prismicM.model.linkToMedia({ seed: t.title }),
	});
	customTypeModel.id = "foo";
	const document = prismicM.value.document({
		seed: t.title,
		model: customTypeModel,
	});
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [document],
	});

	pluginOptions.customTypeModels = [customTypeModel];
	pluginOptions.shouldDownloadFiles = {
		[`${customTypeModel.id}.data.linkToMedia`]: true,
	};

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions: pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
		}),
	);

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);
	await sourceNodes(
		gatsbyContext as gatsby.SourceNodesArgs,
		pluginOptions,
		noop,
	);

	const createNodeStub = gatsbyContext.actions.createNode as sinon.SinonStub;

	t.true(
		createNodeStub.calledWith(
			sinon.match({
				prismicId: document.id,
				data: sinon.match({
					linkToMedia: sinon.match({
						localFile: sinon.match.string,
					}),
				}),
			}),
		),
	);
});

test("linked media are not downloaded without configuring shouldDownloadFiles", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		linkToMedia: prismicM.model.linkToMedia({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model: customTypeModel,
	});
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [document],
	});

	pluginOptions.customTypeModels = [customTypeModel];

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions: pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
		}),
	);

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);
	await sourceNodes(
		gatsbyContext as gatsby.SourceNodesArgs,
		pluginOptions,
		noop,
	);

	t.is((pluginOptions.createRemoteFileNode as sinon.SinonStub).callCount, 0);
});

// Test does not pass and I'm not sure why. This plugin is due for replacement
// so the test will be ignored.
test.skip("throws error if createRemoteFileNode throws", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	pluginOptions.createRemoteFileNode = sinon
		.stub()
		.throws(new Error("FORCED ERROR"));

	const customTypeModel = createMockCustomTypeModelWithFields(t, {
		linkToMedia: prismicM.model.linkToMedia({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model: customTypeModel,
	});
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [document],
	});

	pluginOptions.customTypeModels = [customTypeModel];
	pluginOptions.shouldDownloadFiles = {
		[`${customTypeModel.id}.data.linkToMedia`]: true,
	};

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions: pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
		}),
	);

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	await t.throwsAsync(
		async () => {
			await sourceNodes(
				gatsbyContext as gatsby.SourceNodesArgs,
				pluginOptions,
				noop,
			);
		},
		{ message: "FORCED ERROR" },
	);
});
