import * as prismic from 'ts-prismic'

import { PrismicWebhookBodyApiUpdate, PrismicWebhookType } from '../../src'

export const createWebhookAPIUpdateDocDeletion = (
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
  apiUrl: 'http://qwerty.wroom.test/api',
  secret: 'secret',
})
