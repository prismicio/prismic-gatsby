import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import * as Eq from 'fp-ts/Eq'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies, PrismicWebhookBodyApiUpdate } from './types'
import { reportInfo } from './lib/reportInfo'
import { queryDocumentsByIds } from './lib/queryDocumentsByIds'
import { deleteNodesForDocumentIds } from './lib/deleteNodesForDocumentIds'
import { createNodes } from './lib/createNodes'

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

export const onWebhookApiUpdate = (
  webhookBody: PrismicWebhookBodyApiUpdate,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
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
    RTE.bind('documentIdsToDelete', (scope) =>
      pipe(
        scope.documentIds,
        A.difference(Eq.eqString)(scope.documentIdsToUpdate),
        (ids) => RTE.of(ids),
      ),
    ),
    RTE.chainFirst((scope) =>
      deleteNodesForDocumentIds(scope.documentIdsToDelete),
    ),
    RTE.chainFirst((scope) => createNodes(scope.documentsToUpdate)),
    RTE.map(constVoid),
  )
