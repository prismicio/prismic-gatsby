import test from "ava";
import * as gatsby from "gatsby";
import * as sinon from "sinon";
import browserEnv from "browser-env";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { onClientEntry } from "../src/gatsby-browser";

test.afterEach(() => {
	// Clean up browser-env injections
	// @ts-expect-error - window is not typed as optional
	delete globalThis.window;
});

test.serial("sets plugin options on window", async (t) => {
	const gatsbyContext = createGatsbyContext() as gatsby.BrowserPluginArgs;
	const pluginOptions = createPluginOptions(t);

	browserEnv(["window"]);
	await onClientEntry(gatsbyContext, pluginOptions);

	t.deepEqual(window.__GATSBY_PLUGIN_PRISMIC_PREVIEWS_PLUGIN_OPTIONS__, {
		[pluginOptions.repositoryName]: pluginOptions,
	});
});

test.serial(
	"sets plugin options on window for each configured plugin",
	async (t) => {
		const gatsbyContext = createGatsbyContext() as gatsby.BrowserPluginArgs;
		const pluginOptions1 = createPluginOptions(t);
		const pluginOptions2 = createPluginOptions({
			...t,
			title: "pluginOptions2",
		});

		browserEnv(["window"]);
		await onClientEntry(gatsbyContext, pluginOptions1);
		await onClientEntry(gatsbyContext, pluginOptions2);

		t.deepEqual(window.__GATSBY_PLUGIN_PRISMIC_PREVIEWS_PLUGIN_OPTIONS__, {
			[pluginOptions1.repositoryName]: pluginOptions1,
			[pluginOptions2.repositoryName]: pluginOptions2,
		});
	},
);

test.serial("does not attempt to set plugin options during SSR", async (t) => {
	const gatsbyContext = createGatsbyContext() as gatsby.BrowserPluginArgs;
	const pluginOptions = createPluginOptions(t);

	await onClientEntry(gatsbyContext, pluginOptions);

	t.is(globalThis.window, undefined);
});

test.serial("sets up legacy toolbar for legacy toolbar projects", async (t) => {
	const gatsbyContext = createGatsbyContext() as gatsby.BrowserPluginArgs;
	const pluginOptions = createPluginOptions(t);
	pluginOptions.toolbar = "legacy";

	browserEnv(["window"]);
	await onClientEntry(gatsbyContext, pluginOptions);

	t.deepEqual(globalThis.window.prismic, {
		endpoint: pluginOptions.apiEndpoint,
	});
});

// window is not defined in `onClientEntry` despite being defined by `browserEnv`
test.serial.skip(
	"prints missing styles console warning if styles are missing",
	async (t) => {
		const gatsbyContext = createGatsbyContext() as gatsby.BrowserPluginArgs;
		const pluginOptions = createPluginOptions(t);

		browserEnv(["window"]);

		const spy = sinon.spy(globalThis.window.console, "warn");

		await onClientEntry(gatsbyContext, pluginOptions);

		t.true(spy.calledWith(sinon.match(/styles not found/i)));

		spy.restore();
	},
);
