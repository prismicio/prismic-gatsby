import test, { ExecutionContext } from "ava";
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
import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createPreviewRef } from "./__testutils__/createPreviewRef";
import { navigateToPreviewResolverURL } from "./__testutils__/navigateToPreviewResolverURL";

import {
	PluginOptions,
	PrismicPreviewProvider,
	usePrismicPreviewResolver,
	PrismicRepositoryConfigs,
	usePrismicPreviewContext,
	PrismicPreviewState,
} from "../src";
import { onClientEntry } from "../src/gatsby-browser";

const createConfig = (
	pluginOptions: PluginOptions,
): PrismicRepositoryConfigs => [
	{
		repositoryName: pluginOptions.repositoryName,
		linkResolver: (doc): string => `/${doc.uid}`,
		componentResolver: () => null,
	},
];

/**
 * Fully prepares the environment and hook renderer for `usePrismicPreviewResolver`.
 *
 * Use this function to test post-resolved functionality.
 */
const renderResolverHook = async (t: ExecutionContext) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const config = createConfig(pluginOptions);
	const ref = createPreviewRef(pluginOptions.repositoryName);

	const doc = prismicM.value.document({ seed: t.title });
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [doc],
	});
	const repositoryResponse = prismicM.api.repository({ seed: t.title });

	navigateToPreviewResolverURL(ref, doc.id);
	cookie.set(prismic.cookie.preview, ref);

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: {
				ref,
				q: `[${prismic.predicate.at("document.id", doc.id)}]`,
			},
		}),
	);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);

	const renderHookResult = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const resolve = usePrismicPreviewResolver(config, { fetch });

			return { resolve, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	return {
		...renderHookResult,
		context: {
			gatsbyContext,
			pluginOptions,
			config,
			ref,
			doc,
			queryResponse,
			repositoryResponse,
		},
	};
};

const server = mswNode.setupServer();
test.before(() => {
	browserEnv(["window", "document"], {
		url: "https://example.com",
	});
	server.listen({ onUnhandledRequest: "error" });
	globalThis.location = window.location;
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

test.serial("initial state", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
	const { result } = renderHook(() => usePrismicPreviewContext(), {
		wrapper: PrismicPreviewProvider,
	});

	t.is(result.current[0].previewState, PrismicPreviewState.IDLE);
	t.is(result.current[0].resolvedPath, undefined);
});

test.serial("fails if documentId is not in URL", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const config = createConfig(pluginOptions);
	const ref = createPreviewRef(pluginOptions.repositoryName);

	navigateToPreviewResolverURL(ref, null);
	cookie.set(prismic.cookie.preview, ref);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const resolve = usePrismicPreviewResolver(config, { fetch });

			return { resolve, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	act(() => {
		result.current.resolve();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState ===
				PrismicPreviewState.NOT_PREVIEW,
		),
	);

	t.is(result.current.context[0].previewState, PrismicPreviewState.NOT_PREVIEW);
});

test.serial.only("fails if token is not in cookies", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const config = createConfig(pluginOptions);
	const ref = createPreviewRef(pluginOptions.repositoryName);

	navigateToPreviewResolverURL(ref);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);
	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const resolve = usePrismicPreviewResolver(config, { fetch });

			return { resolve, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	act(() => {
		result.current.resolve();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState ===
				PrismicPreviewState.NOT_PREVIEW,
		),
	);

	t.is(result.current.context[0].previewState, PrismicPreviewState.NOT_PREVIEW);
});

test.serial("fails if repository config is not available", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const ref = createPreviewRef(pluginOptions.repositoryName);

	const doc = prismicM.value.document({
		seed: t.title,
	});
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [doc],
	});
	const repositoryResponse = prismicM.api.repository({
		seed: t.title,
	});

	navigateToPreviewResolverURL(ref, doc.id);
	cookie.set(prismic.cookie.preview, ref);

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: {
				ref,
				q: `[${prismic.predicate.at("document.id", doc.id)}]`,
			},
		}),
	);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);

	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const resolve = usePrismicPreviewResolver([], { fetch });

			return { resolve, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.FAILED,
		),
	);

	if (result.current.context[0].error) {
		t.regex(
			result.current.context[0].error.message,
			/configuration object could not be found/i,
		);
	} else {
		t.fail();
	}
});

test.serial("fails if plugin options are not available", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	// We will use a ref for a different repository. This will simulate the the
	// effect of not having plugin options for the ref's repository.
	const ref = createPreviewRef("different-repository");

	const doc = prismicM.value.document({
		seed: t.title,
	});
	const queryResponse = prismicM.api.query({
		seed: t.title,
		documents: [doc],
	});
	const repositoryResponse = prismicM.api.repository({
		seed: t.title,
	});

	navigateToPreviewResolverURL(ref, doc.id);
	cookie.set(prismic.cookie.preview, ref);

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: {
				ref,
				q: `[${prismic.predicate.at("document.id", doc.id)}]`,
			},
		}),
	);

	onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);

	const { result, waitFor } = renderHook(
		() => {
			const context = usePrismicPreviewContext();
			const resolve = usePrismicPreviewResolver([], { fetch });

			return { resolve, context };
		},
		{ wrapper: PrismicPreviewProvider },
	);

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.FAILED,
		),
	);

	if (result.current.context[0].error) {
		t.regex(
			result.current.context[0].error.message,
			/plugin options could not be found/i,
		);
	} else {
		t.fail();
	}
});

test.serial(
	"prompts for access token if repository access is forbidden",
	async (t) => {
		const gatsbyContext = createGatsbyContext();
		const pluginOptions = createPluginOptions(t);
		const ref = createPreviewRef(pluginOptions.repositoryName);

		const doc = prismicM.value.document({
			seed: t.title,
		});
		const queryResponse = prismicM.api.query({
			seed: t.title,
			documents: [doc],
		});
		const repositoryResponse = prismicM.api.repository({
			seed: t.title,
		});

		navigateToPreviewResolverURL(ref, doc.id);
		cookie.set(prismic.cookie.preview, ref);

		server.use(
			createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
			createAPIQueryMockedRequest({
				pluginOptions,
				repositoryResponse,
				queryResponse,
				searchParams: {
					// We set a different token here to simulate an invalid access token.
					accessToken: "different-token",
					ref,
					q: `[${prismic.predicate.at("document.id", doc.id)}]`,
				},
			}),
		);

		onClientEntry(gatsbyContext as gatsby.BrowserPluginArgs, pluginOptions);

		const { result, waitFor } = renderHook(
			() => {
				const context = usePrismicPreviewContext();
				const resolve = usePrismicPreviewResolver([], { fetch });

				return { resolve, context };
			},
			{ wrapper: PrismicPreviewProvider },
		);

		await waitFor(() =>
			assert.ok(
				result.current.context[0].previewState ===
					PrismicPreviewState.PROMPT_FOR_ACCESS_TOKEN,
			),
		);

		t.is(
			result.current.context[0].previewState,
			PrismicPreviewState.PROMPT_FOR_ACCESS_TOKEN,
		);
	},
);

test.serial("resolves a path using the link resolver", async (t) => {
	const { result, waitFor, context } = await renderResolverHook(t);

	act(() => {
		result.current.resolve();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.RESOLVING,
		),
	);
	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.RESOLVED,
		),
	);

	t.is(result.current.context[0].resolvedPath, context.doc.url);
	t.is(result.current.context[0].error, undefined);
});

test.serial("noop if already resolved", async (t) => {
	const { result, waitFor, context } = await renderResolverHook(t);

	act(() => {
		result.current.resolve();
	});

	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.RESOLVING,
		),
	);
	await waitFor(() =>
		assert.ok(
			result.current.context[0].previewState === PrismicPreviewState.RESOLVED,
		),
	);

	t.is(result.current.context[0].resolvedPath, context.doc.url);
	t.is(result.current.context[0].error, undefined);

	act(() => {
		result.current.resolve();
	});

	t.not(result.current.context[0].previewState, PrismicPreviewState.IDLE);
	t.is(result.current.context[0].resolvedPath, context.doc.url);
	t.is(result.current.context[0].error, undefined);
});
