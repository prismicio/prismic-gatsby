import {
	WINDOW_PLUGIN_OPTIONS_KEY,
	WINDOW_PROVIDER_PRESENCE_KEY,
} from "../src/constants";

import { PluginOptions } from "../src/types";

declare global {
	interface Window {
		[WINDOW_PLUGIN_OPTIONS_KEY]: Record<string, PluginOptions>;
		[WINDOW_PROVIDER_PRESENCE_KEY]: boolean;
		prismic?: {
			endpoint?: string;
		};
	}
}
