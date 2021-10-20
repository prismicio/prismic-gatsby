import * as prismic from "@prismicio/client";

import {
	UnpreparedPluginOptions,
	PrismicWebhookBodyTestTrigger,
	PrismicWebhookType,
} from "../../src";

export const createWebhookTestTrigger = (
	pluginOptions: UnpreparedPluginOptions,
): PrismicWebhookBodyTestTrigger => ({
	type: PrismicWebhookType.TestTrigger,
	domain: pluginOptions.repositoryName,
	apiUrl: (
		pluginOptions.apiEndpoint ||
		prismic.getEndpoint(pluginOptions.repositoryName)
	).replace(/(\.cdn|\/v2)/, ""),
	secret: pluginOptions.webhookSecret ?? null,
});
