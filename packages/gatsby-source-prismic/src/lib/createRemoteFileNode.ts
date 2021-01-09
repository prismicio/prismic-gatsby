import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { createRemoteFileNode as gatsbyCreateRemoteFileNode } from 'gatsby-source-filesystem'

import { Dependencies } from '../types'

export const createRemoteFileNode = (
  url: string,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.Node> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainW((deps) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () =>
            gatsbyCreateRemoteFileNode({
              url,
              store: deps.store,
              cache: deps.cache,
              createNode: deps.createNode,
              createNodeId: deps.createNodeId,
              reporter: deps.reporter,
            }),
          (e) => e as Error,
        ),
      ),
    ),
  )
