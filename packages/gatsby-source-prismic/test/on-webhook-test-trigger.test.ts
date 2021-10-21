import test from "ava";
import * as sinon from "sinon";
import * as mswNode from "msw/node";
import * as prismicM from "@prismicio/mock";

import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createPrismicAPIQueryResponse } from "./__testutils__/createPrismicAPIQueryResponse";
import { createWebhookTestTrigger } from "./__testutils__/createWebhookTestTrigger";

import { sourceNodes } from "../src/source-nodes";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("reports success message", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const webhookBody = createWebhookTestTrigger(pluginOptions);

	gatsbyContext.webhookBody = webhookBody;

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	t.true(
		(gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
			sinon.match(/success/i),
		),
	);
});

test("touches all nodes to prevent garbage collection", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = createPrismicAPIQueryResponse();
	const webhookBody = createWebhookTestTrigger(pluginOptions);

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	gatsbyContext.webhookBody = webhookBody;

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	for (const doc of queryResponse.results) {
		t.true(
			(gatsbyContext.actions.touchNode as sinon.SinonStub).calledWith(
				sinon.match({ prismicId: doc.id }),
			),
		);
	}
});
