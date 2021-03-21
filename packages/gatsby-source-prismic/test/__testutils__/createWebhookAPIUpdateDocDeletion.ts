import * as prismic from 'ts-prismic'

import {
  PluginOptions,
  PrismicWebhookBodyApiUpdate,
  PrismicWebhookType,
} from '../../src'

export const createWebhookAPIUpdateDocDeletion = (
  pluginOptions: PluginOptions,
  documents: prismic.Document[],
): PrismicWebhookBodyApiUpdate => ({
  type: PrismicWebhookType.APIUpdate,
  masterRef: 'masterRef',
  releases: {},
  masks: {},
  tags: {},
  experiments: {},
  documents: documents.map((doc) => doc.id),
  domain: pluginOptions.repositoryName,
  apiUrl: pluginOptions.apiEndpoint.replace(/(\.cdn|\/v2)/, ''),
  secret: pluginOptions.webhookSecret ?? null,
})
