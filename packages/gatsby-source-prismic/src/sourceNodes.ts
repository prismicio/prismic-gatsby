import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import {
  Dependencies,
  createBaseTypes,
  registerCustomTypes,
  registerAllDocumentTypes,
} from 'gatsby-prismic-core'

import { sourceNodesForAllDocuments } from './lib/sourceNodesForAllDocuments'
import { isPrismicWebhookBody } from './lib/isPrismicWebhookBody'
import { isValidWebhookSecret } from './lib/isValidWebhookSecret'
import { deleteNodesForDocumentIds } from './lib/deleteNodesForDocumentIds'
import { sourceNodesForDocumentIds } from './lib/sourceNodesFroDocumentIds'
import { touchAllNodes } from './lib/touchAllNodes'

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
 * defined in the environment's plugin options, nodes are updated and deleted
 * depending on the webhook's contents.
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
  RTE.map((deps) =>
    pipe(
      deps.webhookBody,
      O.fromPredicate(
        (webhookBody) =>
          isPrismicWebhookBody(webhookBody) &&
          isValidWebhookSecret(webhookBody, deps.pluginOptions.webhookSecret),
      ),
      O.map(() => RTE.right({})),
      O.map(RTE.bind('documentIdsToDelete', () => RTE.of([] as string[]))),
      O.map(RTE.bind('documentIdsToUpdate', () => RTE.of([] as string[]))),
      O.map(
        RTE.chainFirst((scope) =>
          deleteNodesForDocumentIds(scope.documentIdsToDelete),
        ),
      ),
      O.map(
        RTE.chainFirst((scope) =>
          sourceNodesForDocumentIds(scope.documentIdsToUpdate),
        ),
      ),
    ),
  ),
  RTE.chain(touchAllNodes),
)
