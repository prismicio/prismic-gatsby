import test from "ava";
import * as mswNode from "msw/node";
import * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";
import * as cookie from "es-cookie";
import * as assert from "assert";
import { renderHook, act, cleanup } from "@testing-library/react-hooks";
import browserEnv from "browser-env";
import fetch from "node-fetch";

import { clearAllCookies } from "./__testutils__/clearAllCookies";
import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createPreviewRef } from "./__testutils__/createPreviewRef";
import { createPrismicAPIDocumentNodeInput } from "./__testutils__/createPrismicAPIDocumentNodeInput";
import { createRuntime } from "./__testutils__/createRuntime";
import { createTypePathsMockedRequest } from "./__testutils__/createTypePathsMockedRequest";
import { jsonFilter } from "./__testutils__/jsonFilter";

import {
	PrismicPreviewProvider,
	useMergePrismicPreviewData,
	usePrismicPreviewBootstrap,
	usePrismicPreviewContext,
	PluginOptions,
	PrismicRepositoryConfigs,
	PrismicPreviewState,
} from "../src";
import { onClientEntry } from "../src/gatsby-browser";

const createStaticData = () => {
	const previewable = createPrismicAPIDocumentNodeInput({ text: "static" });
	previewable._previewable = previewable.prismicId;

	const nonPreviewable = createPrismicAPIDocumentNodeInput({ text: "static" });

	return { previewable, nonPreviewable };
};

const createRepositoryConfigs = (
	pluginOptions: PluginOptions,
): PrismicRepositoryConfigs => [
	{
		repositoryName: pluginOptions.repositoryName,
		linkResolver: (doc): string => `/${doc.uid}`,
	},
];

const server = mswNode.setupServer();
test.before(() => {
	browserEnv(["window", "document"]);
	server.listen({ onUnhandledRequest: "error" });
	window.requestAnimationFrame = function (callback) {
		return setTimeout(callback, 0);
	};
	globalThis.__PATH_PREFIX__ = "https://example.com";
});
test.beforeEach(() => {
	clearAllCookies();
});
test.afterEach(() => {
	cleanup();
});
test.after(() => {
	server.close();
});

test.serial("does not merge if no preview data is available", async (t) => {
	const pluginOptions = createPluginOptions(t);
	const gatsbyContext = createGatsbyContext();
	const staticData = createStaticData();

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(() => useMergePrismicPreviewData(staticData), {
		wrapper: PrismicPreviewProvider,
	});

	t.false(result.current.isPreview);
	t.true(result.current.data === staticData);
});

test.serial(
	"merges data only where `_previewable` field matches",
	async (t) => {
		const pluginOptions = createPluginOptions(t);
		const gatsbyContext = createGatsbyContext();
		const config = createRepositoryConfigs(pluginOptions);

		const model = prismicM.model.customType();
		const documents = Array(20)
			.fill(undefined)
			.map(() => prismicM.value.document({ model }));
		const queryResponse = prismicM.api.query({ seed: t.title, documents });
		const repositoryResponse = prismicM.api.repository({ seed: t.title });

		const runtime = createRuntime(pluginOptions, config[0]);
		runtime.registerCustomTypeModels([model]);
		runtime.registerDocuments(documents);

		const ref = createPreviewRef(pluginOptions.repositoryName);
		cookie.set(prismic.cookie.preview, ref);

		server.use(
			createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
			createAPIQueryMockedRequest({
				pluginOptions,
				repositoryResponse,
				queryResponse,
				searchParams: { ref },
			}),
			createTypePathsMockedRequest(
				pluginOptions.repositoryName,
				runtime.typePaths,
			),
		);

		// Need to use the query results nodes rather than new documents to ensure
		// the IDs match.
		const staticData = jsonFilter({
			previewable: runtime.nodes[0],
			nonPreviewable: runtime.nodes[1],
		});
		staticData.previewable._previewable = runtime.nodes[0].prismicId;
		// Marking this data as "old" and should be replaced during the merge.
		staticData.previewable.uid = "old";

		// @ts-expect-error - Partial gatsbyContext provided
		await onClientEntry(gatsbyContext, pluginOptions);

		const { result, waitFor } = renderHook(
			() => {
				const context = usePrismicPreviewContext();
				const bootstrap = usePrismicPreviewBootstrap(config, { fetch });
				const mergedData = useMergePrismicPreviewData(staticData);

				return { bootstrap, context, mergedData };
			},
			{ wrapper: PrismicPreviewProvider },
		);

		act(() => {
			result.current.bootstrap();
		});

		await waitFor(() =>
			assert.ok(
				result.current.context[0].previewState ===
					PrismicPreviewState.BOOTSTRAPPING,
			),
		);
		await waitFor(() =>
			assert.ok(
				result.current.context[0].previewState === PrismicPreviewState.ACTIVE,
			),
		);

		t.true(result.current.mergedData.isPreview);
		t.true(
			result.current.mergedData.data.previewable.uid === runtime.nodes[0].uid,
		);
	},
);

test.todo("recursively merges data");

test("allows skipping", async (t) => {
	const pluginOptions = createPluginOptions(t);
	const gatsbyContext = createGatsbyContext();
	const config = createRepositoryConfigs(pluginOptions);

	const model = prismicM.model.customType();
	const documents = Array(20)
		.fill(undefined)
		.map(() => prismicM.value.document({ model }));
	const queryResponse = prismicM.api.query({ documents });
	const repositoryResponse = prismicM.api.repository({ seed: t.title });

	const runtime = createRuntime(pluginOptions, config[0]);
	runtime.registerCustomTypeModels([model]);
	runtime.registerDocuments(documents);

	const ref = createPreviewRef(pluginOptions.repositoryName);
	cookie.set(prismic.cookie.preview, ref);

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: { ref },
		}),
		createTypePathsMockedRequest(
			pluginOptions.repositoryName,
			runtime.typePaths,
		),
	);

	// Need to use the query results nodes rather than new documents to ensure
	// the IDs match.
	const staticData = jsonFilter({
		previewable: runtime.nodes[0],
		nonPreviewable: runtime.nodes[1],
	});
	staticData.previewable._previewable = runtime.nodes[0].prismicId;
	// Marking this data as "old" and should be replaced during the merge.
	staticData.previewable.uid = "old";

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);

	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const bootstrap = usePrismicPreviewBootstrap(config, { fetch });
			const mergedData = useMergePrismicPreviewData(staticData, { skip: true });

			return { bootstrap, context, mergedData };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	act(() => {
		result.current.bootstrap();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState ===
				PrismicPreviewState.BOOTSTRAPPING,
		),
	);
	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.ACTIVE,
		),
	);

	t.false(result.current.mergedData.isPreview);
	t.true(result.current.mergedData.data === staticData);
});
