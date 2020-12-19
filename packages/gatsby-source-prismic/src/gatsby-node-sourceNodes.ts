import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import {
  Dependencies,
  reportWarning,
  sourceNodesForAllDocuments,
  touchAllNodes,
} from 'gatsby-prismic-core'

import { isValidWebhookSecret } from './lib/isValidWebhookSecret'
import { isPrismicWebhookBodyApiUpdate } from './lib/isPrismicWebhookBodyApiUpdate'
import { isPrismicWebhookBodyTestTrigger } from './lib/isPrismicWebhookBodyTestTrigger'
import { isPrismicWebhookBodyForRepository } from './lib/isPrismicWebhookBodyForRepository'
import { onApiUpdateWebhook } from './gatsby-node-sourceNodes-onApiUpdateWebhook'
import { onTestTriggerWebhook } from './gatsby-node-sourceNodes-onTestTriggerWebhook'
import { WEBHOOK_SECRET_MISMATCH_MSG } from './constants'
import { PrismicWebhookBody } from './types'

/**
 * To be executed in the `sourceNodes` stage.
 */
export const sourceNodes: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    pipe(
      deps.webhookBody,
      O.fromPredicate(
        (webhookBody) => webhookBody && JSON.stringify(webhookBody) !== '{}',
      ),
      O.fold(sourceNodesForAllDocuments, () => onWebhook),
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
const onWebhook: RTE.ReaderTaskEither<Dependencies, never, void> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    pipe(
      deps.webhookBody,
      O.fromPredicate(
        isPrismicWebhookBodyForRepository(deps.pluginOptions.repositoryName),
      ),
      O.fold(
        () => RTE.of(void 0),
        (webhookBody) => onPrismicWebhook(webhookBody),
      ),
    ),
  ),
  RTE.chain(touchAllNodes),
)

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
            if (isPrismicWebhookBodyApiUpdate(webhookBody))
              return onApiUpdateWebhook(webhookBody)

            if (isPrismicWebhookBodyTestTrigger(webhookBody))
              return onTestTriggerWebhook

            // This webhook is unsupported or does not pertain to this plugin.
            return RTE.of(void 0)
          },
        ),
      ),
    ),
  )
