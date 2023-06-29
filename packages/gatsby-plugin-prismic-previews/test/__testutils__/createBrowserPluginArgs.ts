import { BrowserPluginArgs } from "gatsby";

export const createBrowserPluginArgs = (): BrowserPluginArgs => {
	return {
		getResourceURLsForPathname: () => {
			throw new Error("not implemented");
		},
	};
};
