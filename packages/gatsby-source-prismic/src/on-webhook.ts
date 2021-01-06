import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { isPrismicWebhookBodyApiUpdate } from './lib/isPrismicWebhookBodyApiUpdate'
import { isPrismicWebhookBodyForRepository } from './lib/isPrismicWebhookBodyForRepository'
import { isPrismicWebhookBodyTestTrigger } from './lib/isPrismicWebhookBodyTestTrigger'
import { isValidWebhookSecret } from './lib/isValidWebhookSecret'
import { reportWarning } from './lib/reportWarning'
import { touchAllNodes } from './lib/touchAllNodes'

import { Dependencies, PrismicWebhookBody } from './types'
import { WEBHOOK_SECRET_MISMATCH_MSG } from './constants'
import { onWebhookApiUpdate } from './on-webhook-api-update'
import { onWebhookTestTrigger } from './on-webhook-test-trigger'

const onPrismicWebhook = (
  webhookBody: PrismicWebhookBody,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        webhookBody,
        O.fromPredicate(isValidWebhookSecret(deps.pluginOptions.webhookSecret)),
        O.fold(
          () => reportWarning(WEBHOOK_SECRET_MISMATCH_MSG),
          (webhookBody) => {
            if (isPrismicWebhookBodyApiUpdate(webhookBody)) {
              return onWebhookApiUpdate(webhookBody)
            }

            if (isPrismicWebhookBodyTestTrigger(webhookBody)) {
              return onWebhookTestTrigger
            }

            // This webhook is unsupported or does not pertain to this plugin.
            return RTE.of(void 0)
          },
        ),
      ),
    ),
  )

/**
 * To be executed in the `sourceNodes` stage when a webhook is received.
 *
 * If the webhook is from Prismic, and the webhook's secret matches the secret
 * defined in the environment's plugin options, a handler appropriate to the
 * webhook's type is called.
 *
 * All nodes, regardless of the webhook' source or contents, are touched to
 * prevent garbage collection.
 */
export const onWebhook: RTE.ReaderTaskEither<Dependencies, never, void> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    pipe(
      deps.webhookBody,
      O.fromPredicate(
        isPrismicWebhookBodyForRepository(deps.pluginOptions.repositoryName),
      ),
      O.fold(() => RTE.of(void 0), onPrismicWebhook),
    ),
  ),
  RTE.chain(touchAllNodes),
)
