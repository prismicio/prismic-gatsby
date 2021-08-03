import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, TypePathKind, TypePathNode } from '../types'

import { dotPath } from './dotPath'

/**
 * Returns a `TypePath` node for a given path using the environment's `getNode`
 * function.
 *
 * @param path Path used as a key to find a matching TypePath node.
 *
 * @returns The TypePath with the given key, if available.
 */
export const getTypePath = (
  kind: TypePathKind,
  path: string[],
): RTE.ReaderTaskEither<Dependencies, Error, TypePathNode> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('nodeId', (scope) =>
      RTE.right(
        scope.nodeHelpers.createNodeId([
          'TypePathType',
          [kind, ...path].toString(),
        ]),
      ),
    ),
    RTE.chain((scope) =>
      RTE.fromIO(() => scope.getNode(scope.nodeId) as TypePathNode),
    ),
    RTE.filterOrElse(
      (result) => result != null,
      () =>
        new Error(
          `Could not find a "${kind}" type path for path: "${dotPath(path)}"`,
        ),
    ),
  )
