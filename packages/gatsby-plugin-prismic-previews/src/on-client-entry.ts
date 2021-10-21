import * as gatsby from "gatsby";

import { PluginOptions } from "./types";
import { WINDOW_PLUGIN_OPTIONS_KEY } from "./constants";

/**
 * Called when the Gatsby browser runtime first starts.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#onClientEntry
 */
export const onClientEntry: NonNullable<gatsby.GatsbyBrowser["onClientEntry"]> =
	(_gatsbyContext, pluginOptions: PluginOptions) => {
		if (typeof window !== "undefined") {
			window[WINDOW_PLUGIN_OPTIONS_KEY] = {
				...window[WINDOW_PLUGIN_OPTIONS_KEY],
				[pluginOptions.repositoryName]: pluginOptions,
			};

			if (pluginOptions.toolbar === "legacy") {
				window.prismic = {
					...window.prismic,
					endpoint: pluginOptions.apiEndpoint,
				};
			}
		}
	};
