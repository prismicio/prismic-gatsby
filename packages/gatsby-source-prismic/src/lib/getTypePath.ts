import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, TypePathNode } from '../types'

import { dotPath } from './dotPath'

export const getTypePath = (
  path: string[],
): RTE.ReaderTaskEither<Dependencies, Error, TypePathNode> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('nodeId', (scope) =>
      RTE.right(
        scope.nodeHelpers.createNodeId(['TypePathType', path.toString()]),
      ),
    ),
    RTE.chain((scope) =>
      RTE.fromIO(() => scope.getNode(scope.nodeId) as TypePathNode),
    ),
    RTE.filterOrElse(
      (result) => result != null,
      () =>
        new Error(`Could not find a type path for path: "${dotPath(path)}"`),
    ),
  )
