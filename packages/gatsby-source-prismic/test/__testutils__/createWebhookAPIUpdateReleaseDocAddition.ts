import * as prismic from 'ts-prismic'

import { PrismicWebhookBodyApiUpdate, PrismicWebhookType } from '../../src'

export const createWebhookAPIUpdateReleaseDocAddition = (
  documents: prismic.Document[],
): PrismicWebhookBodyApiUpdate => ({
  type: PrismicWebhookType.APIUpdate,
  masterRef: 'masterRef',
  releases: {
    update: [
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
  domain: 'qwerty',
  apiUrl: 'http://qwerty.prismic.io/api',
  secret: 'secret',
})
