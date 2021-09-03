import * as gatsby from "gatsby";

import { sprintf } from "./lib/sprintf";

import { PluginOptions } from "./types";
import { MISSING_STYLES_MSG, WINDOW_PLUGIN_OPTIONS_KEY } from "./constants";

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

			if (process.env.NODE_ENV === "development") {
				const propertyValue = window
					.getComputedStyle(window.document.body)
					.getPropertyValue("--styles");

				if (!propertyValue) {
					console.warn(sprintf(MISSING_STYLES_MSG, "styles"));
				}
			}
		}
	};
