import { isPrismicWebhookBody } from "./isPrismicWebhookBody";

import { PrismicWebhookBody } from "../types";

/**
 * Determines if some piece of data is a Prismic webhook body for a given repository.
 *
 * @param webhookBody - Piece of data to test.
 * @param repositoryName - Name of the repository to check the webhook body against.
 */
export const isPrismicWebhookBodyForRepository =
	(repositoryName: string) =>
	(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
		webhookBody: any,
	): webhookBody is PrismicWebhookBody =>
		isPrismicWebhookBody(webhookBody) && webhookBody.domain === repositoryName;
