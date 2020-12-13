import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import {
  Dependencies,
  createBaseTypes,
  registerCustomTypes,
  registerAllDocumentTypes,
  reportInfo,
} from 'gatsby-prismic-core'

import { sourceNodesForAllDocuments } from './lib/sourceNodesForAllDocuments'
import { isValidWebhookSecret } from './lib/isValidWebhookSecret'
import { touchAllNodes } from './lib/touchAllNodes'
import { isPrismicWebhookBodyApiUpdate } from './lib/isPrismicWebhookBodyApiUpdate'
import { isPrismicWebhookBodyTestTrigger } from './lib/isPrismicWebhookBodyTestTrigger'
import { isPrismicWebhookBodyForRepository } from './lib/isPrismicWebhookBodyForRepository'
import { PrismicWebhookBody } from './types'
import { onApiUpdateWebhook } from './onApiUpdateWebhook'
import { onTestTriggerWebhook } from './onTestTriggerWebhook'

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
      O.fromNullable(deps.webhookBody),
      O.fold(
        () => sourceNodesOnBoot,
        () => sourceNodesOnWebhook,
      ),
    ),
  ),
)

/**
 * To be executed in the `sourceNodes` stage on initial start-up.
 *
 * All GraphQL types are registered and all documents for the environment's
 * Prismic repository are sourced.
 */
const sourceNodesOnBoot: RTE.ReaderTaskEither<Dependencies, never, void> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain(createBaseTypes),
  RTE.chain(flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes))),
  RTE.chain(sourceNodesForAllDocuments),
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
const sourceNodesOnWebhook: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
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
          () =>
            reportInfo(
              'A webhook was received, but the webhook secret did not match the webhook secret provided in the plugin options. If this is unexpected, verify that the `webhookSecret` plugin option matches the webhook secret in your Prismic repository.',
            ),
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
