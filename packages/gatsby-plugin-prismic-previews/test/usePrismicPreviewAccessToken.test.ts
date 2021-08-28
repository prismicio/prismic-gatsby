import test from "ava";
import { renderHook, act } from "@testing-library/react-hooks";
import browserEnv from "browser-env";

import { clearAllCookies } from "./__testutils__/clearAllCookies";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { usePrismicPreviewAccessToken, PrismicPreviewProvider } from "../src";
import { onClientEntry } from "../src/gatsby-browser";

test.before(() => {
	browserEnv(["window", "document"]);
});
test.beforeEach(() => {
	clearAllCookies();
});

test.serial("returns the current access token", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(
		() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
		{ wrapper: PrismicPreviewProvider },
	);

	t.true(result.current[0] === pluginOptions.accessToken);
});

test.serial("access token is empty if not set", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	pluginOptions.accessToken = undefined;

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(
		() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
		{ wrapper: PrismicPreviewProvider },
	);

	t.true(result.current[0] === undefined);
});

test.serial("set function sets access token in context", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	pluginOptions.accessToken = undefined;

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(
		() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
		{ wrapper: PrismicPreviewProvider },
	);

	t.true(result.current[0] === pluginOptions.accessToken);

	const newAccessToken = "newAccessToken";
	act(() => {
		result.current[1].set(newAccessToken);
	});

	t.true(result.current[0] === newAccessToken);
});

test.serial("set function sets access token cookie by default", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	pluginOptions.accessToken = undefined;

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(
		() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
		{ wrapper: PrismicPreviewProvider },
	);

	const newAccessToken = "newAccessToken";
	act(() => {
		result.current[1].set(newAccessToken);
	});

	t.true(
		new RegExp(
			`; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
		).test(document.cookie),
	);
});

test.serial("set function does not set cookie if remember=false", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	pluginOptions.accessToken = undefined;

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const { result } = renderHook(
		() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
		{ wrapper: PrismicPreviewProvider },
	);

	const newAccessToken = "newAccessToken";
	act(() => {
		result.current[1].set(newAccessToken, false);
	});

	t.false(
		new RegExp(
			`; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
		).test(document.cookie),
	);
});

test.serial(
	"remove function removes access token cookie if it is set",
	async (t) => {
		const pluginOptions = createPluginOptions(t);
		const gatsbyContext = createGatsbyContext();
		pluginOptions.accessToken = undefined;

		// @ts-expect-error - Partial gatsbyContext provided
		await onClientEntry(gatsbyContext, pluginOptions);
		const { result } = renderHook(
			() => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
			{ wrapper: PrismicPreviewProvider },
		);

		const newAccessToken = "newAccessToken";
		act(() => {
			result.current[1].set(newAccessToken);
		});

		t.true(
			new RegExp(
				`; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
			).test(document.cookie),
		);

		act(() => {
			result.current[1].removeCookie();
		});

		t.false(
			new RegExp(
				`; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
			).test(document.cookie),
		);
	},
);
