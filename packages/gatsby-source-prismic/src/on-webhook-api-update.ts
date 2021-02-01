import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import * as Eq from 'fp-ts/Eq'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies, PrismicWebhookBodyApiUpdate } from './types'
import { reportInfo } from './lib/reportInfo'
import { queryDocumentsByIds } from './lib/queryDocumentsByIds'
import { deleteNodesForDocumentIds } from './lib/deleteNodesForDocumentIds'
import { createNodes } from './lib/createNodes'

/**
 * Extract all document IDs from a Prismic `api-update` webhook body. All
 * document IDs, including deleted documents, are returned in the same list.
 */
const extractApiUpdateWebhookBodyDocumentIds = (
  webhookBody: PrismicWebhookBodyApiUpdate,
): RTE.ReaderTaskEither<Dependencies, never, string[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bindW('documentIds', () => RTE.right(webhookBody.documents)),
    RTE.bindW('releaseDocumentIds', (scope) =>
      pipe(
        [
          ...(webhookBody.releases.update || []),
          ...(webhookBody.releases.addition || []),
          ...(webhookBody.releases.deletion || []),
        ],
        A.filter((payload) => payload.id === scope.pluginOptions.releaseID),
        A.chain((payload) => payload.documents),
        RTE.right,
      ),
    ),
    RTE.map((scope) => [...scope.documentIds, ...scope.releaseDocumentIds]),
  )

/**
 * To be executed in the `sourceNodes` API when a Prismic `api-update` webhook
 * is received.
 *
 * This handler is implemented specifically for Gatsby Preview support.
 *
 * This handler performs delta changes to documents that have been updated or
 * deleted.
 *
 * - UPDATED documents: Nodes are updated in the Gatsby data layer.
 * - DELETED documents: Nodes are deleted from the Gatsby data layer.
 *
 * After the handle is complete, the Gatsby data layer should be identical to
 * one that just performed a fresh bootstrap.
 */
export const onWebhookApiUpdate = (
  webhookBody: PrismicWebhookBodyApiUpdate,
): RTE.ReaderTaskEither<Dependencies, Error, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() =>
      reportInfo('Received API update webhook. Processing changes.'),
    ),
    RTE.bind('documentIds', () =>
      extractApiUpdateWebhookBodyDocumentIds(webhookBody),
    ),
    RTE.bind('documentsToUpdate', (scope) =>
      queryDocumentsByIds(scope.documentIds),
    ),
    RTE.bind('documentIdsToUpdate', (scope) =>
      pipe(
        scope.documentsToUpdate,
        A.map((document) => document.id),
        (ids) => RTE.of(ids),
      ),
    ),
    // Documents that have been deleted are included in the `documents` field,
    // but they are not marked as deleted. They appear adjacent to documents
    // that still exist but have only been updated.
    //
    // To check if the document was deleted, we query for all documents in the
    // `documents` field and compare the result to that list. Documents that
    // have been deleted will not be returned from the query.
    RTE.bind('documentIdsToDelete', (scope) =>
      pipe(
        scope.documentIds,
        A.difference(Eq.eqString)(scope.documentIdsToUpdate),
        (ids) => RTE.of(ids),
      ),
    ),
    RTE.chainFirstW((scope) =>
      deleteNodesForDocumentIds(scope.documentIdsToDelete),
    ),
    RTE.chainFirstW((scope) => createNodes(scope.documentsToUpdate)),
    RTE.map(constVoid),
  )
