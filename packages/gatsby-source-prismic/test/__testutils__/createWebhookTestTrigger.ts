import {
  PluginOptions,
  PrismicWebhookBodyTestTrigger,
  PrismicWebhookType,
} from '../../src'

export const createWebhookTestTrigger = (
  pluginOptions: PluginOptions,
): PrismicWebhookBodyTestTrigger => ({
  type: PrismicWebhookType.TestTrigger,
  domain: pluginOptions.repositoryName,
  apiUrl: pluginOptions.apiEndpoint.replace(/(\.cdn|\/v2)/, ''),
  secret: pluginOptions.webhookSecret ?? null,
})
