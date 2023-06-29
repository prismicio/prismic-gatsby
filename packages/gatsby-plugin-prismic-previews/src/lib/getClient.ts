import type { Client } from "@prismicio/client";
import { createClient as baseCreateClient } from "@prismicio/client";

import type { PluginOptions } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

export const getClient = (pluginOptions: PluginOptions): Client => {
	const state = usePrismicPreviewStore.getState();

	if (state.client) {
		return state.client;
	} else {
		const client = baseCreateClient(
			pluginOptions.apiEndpoint || pluginOptions.repositoryName,
			{
				accessToken: pluginOptions.accessToken,
				routes: pluginOptions.routes,
				defaultParams: {
					lang: pluginOptions.lang || "*",
					fetchLinks: pluginOptions.fetchLinks,
					graphQuery: pluginOptions.graphQuery,
					predicates: pluginOptions.predicates,
				},
			},
		);

		state.setClient(client);

		return client;
	}
};
