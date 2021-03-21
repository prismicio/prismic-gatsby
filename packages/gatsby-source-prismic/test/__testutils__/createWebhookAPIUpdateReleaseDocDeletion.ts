import * as prismic from 'ts-prismic'

import {
  PluginOptions,
  PrismicWebhookBodyApiUpdate,
  PrismicWebhookType,
} from '../../src'

export const createWebhookAPIUpdateReleaseDocDeletion = (
  pluginOptions: PluginOptions,
  documents: prismic.Document[],
): PrismicWebhookBodyApiUpdate => ({
  type: PrismicWebhookType.APIUpdate,
  masterRef: 'masterRef',
  releases: {
    deletion: [
      {
        id: 'release',
        ref: 'release',
        label: 'release',
        documents: documents.map((doc) => doc.id),
      },
    ],
  },
  masks: {},
  tags: {},
  experiments: {},
  documents: [],
  domain: pluginOptions.repositoryName,
  apiUrl: pluginOptions.apiEndpoint.replace(/(\.cdn|\/v2)/, ''),
  secret: pluginOptions.webhookSecret ?? null,
})
