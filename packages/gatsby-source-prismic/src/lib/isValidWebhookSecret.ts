import { PrismicWebhookBody } from '../types'

/**
 * Determines if a webhook body's secret matches a given secret. If no secret
 * is given, any webhook body secret is valid, including the absence of a
 * webhook body secret.
 *
 * @param webhookBody Webhook body optionally containing a secret.
 * @param secret Secret to test against the webhook body.
 *
 * @returns `true` if the secret is valid, `false` otherwise.
 */
export const isValidWebhookSecret = (secret?: string) => (
  webhookBody: PrismicWebhookBody,
): boolean => (secret ? webhookBody.secret === secret : true)
