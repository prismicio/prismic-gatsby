import { PrismicWebhookBodyTestTrigger, PrismicWebhookType } from '../../src'

export const createWebhookTestTrigger = (): PrismicWebhookBodyTestTrigger => ({
  type: PrismicWebhookType.TestTrigger,
  domain: 'qwerty',
  apiUrl: 'http://qwerty.wroom.test/api',
  secret: 'secret',
})
