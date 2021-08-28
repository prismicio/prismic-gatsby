import test from "ava";
import * as sinon from "sinon";
import * as mswn from "msw/node";
import * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";

import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createWebhookAPIUpdateDocAddition } from "./__testutils__/createWebhookAPIUpdateDocAddition";
import { createWebhookAPIUpdateDocDeletion } from "./__testutils__/createWebhookAPIUpdateDocDeletion";
import { createWebhookAPIUpdateReleaseDocAddition } from "./__testutils__/createWebhookAPIUpdateReleaseDocAddition";
import { createWebhookAPIUpdateReleaseDocDeletion } from "./__testutils__/createWebhookAPIUpdateReleaseDocDeletion";

import { sourceNodes } from "../src/source-nodes";

const server = mswn.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("reports received message", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({ seed: t.title });
	const webhookBody = createWebhookAPIUpdateDocAddition(
		pluginOptions,
		queryResponse.results,
	);

	gatsbyContext.webhookBody = webhookBody;

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

	t.true(
		(gatsbyContext.reporter.info as sinon.SinonStub).calledWith(
			sinon.match(/received/i),
		),
	);
});

test("doc addition creates/updates node", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const documents = [
		prismicM.value.document({ seed: t.title }),
		prismicM.value.document({ seed: t.title }),
	];
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({ seed: t.title, documents });
	const webhookBody = createWebhookAPIUpdateDocAddition(
		pluginOptions,
		queryResponse.results,
	);

	gatsbyContext.webhookBody = webhookBody;

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			queryResponse,
			repositoryResponse,
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	t.true(
		webhookBody.documents.every((docId) =>
			(gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
				sinon.match.has("prismicId", docId),
			),
		),
	);
});

test("doc deletion deletes node", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	// The query response only includes the first document of `docs`.
	// But the webhook body includes both docs.
	// This signals that the second doc has been deleted.
	const documents = [
		prismicM.value.document({ seed: t.title }),
		prismicM.value.document({ seed: t.title }),
	];
	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const preWebhookQueryResponse = prismicM.api.query({
		seed: t.title,
		documents,
	});
	const postWebhookQueryResponse = prismicM.api.query({
		seed: t.title,
		documents: documents.slice(0, 1),
	});
	const webhookBody = createWebhookAPIUpdateDocDeletion(
		pluginOptions,
		documents,
	);

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse: preWebhookQueryResponse,
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	gatsbyContext.webhookBody = webhookBody;

	server.use(
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse: postWebhookQueryResponse,
			searchParams: {
				q: `[${prismic.predicate.in("document.id", webhookBody.documents)}]`,
			},
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	for (const doc of documents.slice(1)) {
		t.true(
			(gatsbyContext.actions.deleteNode as sinon.SinonStub).calledWith(
				sinon.match.has("prismicId", doc.id),
			),
		);
	}
});

test("release doc addition creates/updates node if plugin options release ID matches", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const documents = [
		prismicM.value.document({ seed: t.title }),
		prismicM.value.document({ seed: t.title }),
	];
	const queryResponse = prismicM.api.query({ seed: t.title, documents });
	const webhookBody = createWebhookAPIUpdateReleaseDocAddition(
		pluginOptions,
		queryResponse.results,
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const webhookBodyReleaseUpdate = webhookBody.releases.update![0];

	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	repositoryResponse.refs = [
		...repositoryResponse.refs,
		{
			...prismicM.api.ref({ seed: t.title }),
			id: webhookBodyReleaseUpdate.id,
			ref: webhookBodyReleaseUpdate.ref,
		},
	];

	gatsbyContext.webhookBody = webhookBody;
	pluginOptions.releaseID = webhookBodyReleaseUpdate.id;

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
	);
	server.use(
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: {
				ref: webhookBodyReleaseUpdate.ref,
				q: `[${prismic.predicate.in(
					"document.id",
					webhookBodyReleaseUpdate.documents,
				)}]`,
			},
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	for (const docId of webhookBodyReleaseUpdate.documents) {
		t.true(
			(gatsbyContext.actions.createNode as sinon.SinonStub).calledWith(
				sinon.match.has("prismicId", docId),
			),
		);
	}
});

test("release doc addition does nothing if plugin options release ID does not match", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	const queryResponse = prismicM.api.query({ seed: t.title });
	const webhookBody = createWebhookAPIUpdateReleaseDocAddition(
		pluginOptions,
		queryResponse.results,
	);

	gatsbyContext.webhookBody = webhookBody;

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
	);
	server.use(
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: {
				q: `[${prismic.predicate.in("document.id", [])}]`,
			},
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	t.true((gatsbyContext.actions.createNode as sinon.SinonStub).notCalled);
});

test("release doc deletion deletes node if plugin options release ID matches", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	// The query response only includes the first document of `docs`.
	// But the webhook body includes both docs.
	// This signals that the second doc has been deleted.
	const documents = [
		prismicM.value.document({ seed: t.title }),
		prismicM.value.document({ seed: t.title }),
	];
	const preWebhookQueryResponse = prismicM.api.query({
		seed: t.title,
		documents,
	});
	const postWebhookQueryResponse = prismicM.api.query({
		seed: t.title,
		documents: documents.slice(0, 1),
	});
	const webhookBody = createWebhookAPIUpdateReleaseDocDeletion(
		pluginOptions,
		documents,
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const webhookBodyReleaseDeletion = webhookBody.releases.deletion![0];

	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	repositoryResponse.refs = [
		...repositoryResponse.refs,
		{
			...prismicM.api.ref({ seed: t.title }),
			id: webhookBodyReleaseDeletion.id,
			ref: webhookBodyReleaseDeletion.ref,
		},
	];

	pluginOptions.releaseID = webhookBodyReleaseDeletion.id;

	server.use(
		createAPIRepositoryMockedRequest({
			pluginOptions,
			repositoryResponse,
		}),
	);
	server.use(
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse: preWebhookQueryResponse,
			searchParams: {
				ref: webhookBodyReleaseDeletion.ref,
			},
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	gatsbyContext.webhookBody = webhookBody;

	server.use(
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse: postWebhookQueryResponse,
			searchParams: {
				ref: webhookBodyReleaseDeletion.ref,
				q: `[${prismic.predicate.in(
					"document.id",
					webhookBodyReleaseDeletion.documents,
				)}]`,
			},
		}),
	);

	// @ts-expect-error - Partial gatsbyContext provided
	await sourceNodes(gatsbyContext, pluginOptions);

	for (const doc of documents.slice(1)) {
		t.true(
			(gatsbyContext.actions.deleteNode as sinon.SinonStub).calledWith(
				sinon.match.has("prismicId", doc.id),
			),
		);
	}
});

test("release doc deletion does nothing if plugin options release ID does not match", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const queryResponse = prismicM.api.query({ seed: t.title });
	const webhookBody = createWebhookAPIUpdateReleaseDocDeletion(
		pluginOptions,
		queryResponse.results,
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const webhookBodyReleaseDeletion = webhookBody.releases.deletion![0];

	const repositoryResponse = prismicM.api.repository({ seed: t.title });
	repositoryResponse.refs = [
		...repositoryResponse.refs,
		{
			...prismicM.api.ref({ seed: t.title }),
			id: webhookBodyReleaseDeletion.id,
			ref: webhookBodyReleaseDeletion.ref,
		},
	];

	gatsbyContext.webhookBody = webhookBody;

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

	t.true((gatsbyContext.actions.deleteNode as sinon.SinonStub).notCalled);
});
