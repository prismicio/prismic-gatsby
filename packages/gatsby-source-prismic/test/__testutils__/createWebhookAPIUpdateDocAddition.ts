import * as prismic from 'ts-prismic'

import { PrismicWebhookBodyApiUpdate, PrismicWebhookType } from '../../src'

export const createWebhookAPIUpdateDocAddition = (
  documents: prismic.Document[],
): PrismicWebhookBodyApiUpdate => ({
  type: PrismicWebhookType.APIUpdate,
  masterRef: 'masterRef',
  releases: {},
  masks: {},
  tags: {},
  experiments: {},
  documents: documents.map((doc) => doc.id),
  domain: 'qwerty',
  apiUrl: 'http://qwerty.prismic.io/api',
  secret: 'secret',
})
