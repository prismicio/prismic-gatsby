import test from "ava";
import * as mswNode from "msw/node";
import * as gatsby from "gatsby";
import * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";
import * as cookie from "es-cookie";
import * as assert from "assert";
import { renderHook, act, cleanup } from "@testing-library/react-hooks";
import browserEnv from "browser-env";
import fetch from "node-fetch";

import { clearAllCookies } from "./__testutils__/clearAllCookies";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createPreviewRef } from "./__testutils__/createPreviewRef";
import { createTypePathsMockedRequest } from "./__testutils__/createTypePathsMockedRequest";

import {
	PrismicPreviewProvider,
	usePrismicPreviewBootstrap,
	usePrismicPreviewContext,
	PluginOptions,
	PrismicRepositoryConfigs,
	PrismicPreviewState,
} from "../src";
import { onClientEntry } from "../src/gatsby-browser";
import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createRuntime } from "./__testutils__/createRuntime";

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

test.serial("fails if not a preview session - cookie is not set", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const config = createRepositoryConfigs(pluginOptions);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const bootstrap = usePrismicPreviewBootstrap(config, { fetch });

			return { bootstrap, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	act(() => {
		result.current.bootstrap();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState ===
				PrismicPreviewState.NOT_PREVIEW,
		),
	);

	const state = result.current.context[0];

	t.is(state.previewState, PrismicPreviewState.NOT_PREVIEW);
});

test.serial(
	"fetches all repository documents and bootstraps context",
	async (t) => {
		const gatsbyContext = createGatsbyContext();
		const pluginOptions = createPluginOptions(t);
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
				"fa7e36097b060b84eb14d0df1009fa58.json",
				runtime.typePaths,
			),
		);

		onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
		const { result, waitFor } = renderHook(
			() => {
				const context = usePrismicPreviewContext();
				const bootstrap = usePrismicPreviewBootstrap(config, { fetch });

				return { bootstrap, context };
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
		t.true(result.current.context[0].error === undefined);
		t.true(result.current.context[0].isBootstrapped);
		t.deepEqual(
			result.current.context[0].runtimeStore[pluginOptions.repositoryName]
				.nodes,
			runtime.nodes,
		);
	},
);

test.serial("does nothing if already bootstrapped", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
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
			"d6c42f6728e21ab594cd600ff04e4913.json",
			runtime.typePaths,
		),
	);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const bootstrap = usePrismicPreviewBootstrap(config, { fetch });

			return { bootstrap, context };
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
	t.is(result.current.context[0].error, undefined);

	// Bootstrap the second time.
	act(() => {
		result.current.bootstrap();
	});

	t.is(result.current.context[0].previewState, PrismicPreviewState.ACTIVE);
});
