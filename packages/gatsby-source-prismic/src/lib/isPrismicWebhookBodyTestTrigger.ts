import { isPrismicWebhookBody } from "./isPrismicWebhookBody";

import { PrismicWebhookBodyTestTrigger, PrismicWebhookType } from "../types";

/**
 * Determines if some piece of data is a Prismic `api-update` webhook body.
 *
 * @param webhookBody - Piece of data to test.
 */
export const isPrismicWebhookBodyTestTrigger = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
	webhookBody: any,
): webhookBody is PrismicWebhookBodyTestTrigger =>
	isPrismicWebhookBody(webhookBody) &&
	webhookBody.type === PrismicWebhookType.TestTrigger;
