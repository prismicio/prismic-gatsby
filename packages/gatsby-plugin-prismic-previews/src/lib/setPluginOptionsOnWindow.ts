import * as IO from "fp-ts/IO";

import { WINDOW_PLUGIN_OPTIONS_KEY } from "../constants";
import { PluginOptions } from "../types";

// This store is primary just used during testing. During the SSR build of a
// Gatsby site, this function is not called.
export const ssrPluginOptionsStore: Record<string, PluginOptions> = {};

declare global {
	interface Window {
		[WINDOW_PLUGIN_OPTIONS_KEY]: Record<string, PluginOptions>;
	}
}

export const setPluginOptionsOnWindow =
	(pluginOptions: PluginOptions): IO.IO<void> =>
	() => {
		if (typeof window === "undefined") {
			Object.assign(ssrPluginOptionsStore, {
				[pluginOptions.repositoryName]: pluginOptions,
			});
		} else {
			window[WINDOW_PLUGIN_OPTIONS_KEY] = {
				...window[WINDOW_PLUGIN_OPTIONS_KEY],
				[pluginOptions.repositoryName]: pluginOptions,
			};
		}
	};
