import * as prismicT from '@prismicio/types'

import {
  PluginOptions,
  PrismicWebhookBodyApiUpdate,
  PrismicWebhookType,
} from '../../src'

/**
 * @remark A deletion webhook is only triggered when a Release is published or deleted. It is *not* triggered when a document within a release is deleted.
 */
export const createWebhookAPIUpdateReleaseDocDeletion = (
  pluginOptions: PluginOptions,
  documents: prismicT.PrismicDocument[],
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
