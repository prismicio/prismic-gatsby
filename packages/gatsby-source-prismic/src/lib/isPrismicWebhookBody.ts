import { isPrismicURL } from './isPrismicURL'

import { PrismicWebhookBody } from '../types'

/**
 * Determines if some piece of data is a Prismic webhook body.
 *
 * @param webhookBody Piece of data to test.
 */
export const isPrismicWebhookBody = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  webhookBody: any,
): webhookBody is PrismicWebhookBody =>
  typeof webhookBody === 'object' &&
  typeof webhookBody.apiUrl === 'string' &&
  isPrismicURL(webhookBody.apiUrl)
