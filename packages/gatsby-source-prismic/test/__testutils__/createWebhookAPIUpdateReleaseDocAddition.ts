import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";

import {
	PluginOptions,
	PrismicWebhookBodyApiUpdate,
	PrismicWebhookType,
} from "../../src";

export const createWebhookAPIUpdateReleaseDocAddition = (
	pluginOptions: PluginOptions,
	documents: prismicT.PrismicDocument[],
): PrismicWebhookBodyApiUpdate => ({
	type: PrismicWebhookType.APIUpdate,
	masterRef: "masterRef",
	releases: {
		update: [
			{
				id: "release",
				ref: "release",
				label: "release",
				documents: documents.map((doc) => doc.id),
			},
		],
	},
	masks: {},
	tags: {},
	experiments: {},
	documents: [],
	domain: pluginOptions.repositoryName,
	apiUrl: (
		pluginOptions.apiEndpoint ||
		prismic.getEndpoint(pluginOptions.repositoryName)
	).replace(/(\.cdn|\/v2)/, ""),
	secret: pluginOptions.webhookSecret ?? null,
});
