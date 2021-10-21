import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";

import {
	UnpreparedPluginOptions,
	PrismicWebhookBodyApiUpdate,
	PrismicWebhookType,
} from "../../src";

export const createWebhookAPIUpdateDocAddition = (
	pluginOptions: UnpreparedPluginOptions,
	documents: prismicT.PrismicDocument[],
): PrismicWebhookBodyApiUpdate => ({
	type: PrismicWebhookType.APIUpdate,
	masterRef: "masterRef",
	releases: {},
	masks: {},
	tags: {},
	experiments: {},
	documents: documents.map((doc) => doc.id),
	domain: pluginOptions.repositoryName,
	apiUrl: (
		pluginOptions.apiEndpoint ||
		prismic.getEndpoint(pluginOptions.repositoryName)
	).replace(/(\.cdn|\/v2)/, ""),
	secret: pluginOptions.webhookSecret ?? null,
});
