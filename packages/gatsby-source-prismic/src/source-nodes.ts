import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'

import { sourceNodesForAllDocuments } from './lib/sourceNodesForAllDocuments'

import { Dependencies, PluginOptions } from './types'
import { buildDependencies } from './buildDependencies'
import { onWebhook } from './on-webhook'

export const sourceNodes: NonNullable<
  gatsby.GatsbyNode['sourceNodes']
> = async (
  gatsbyContext: gatsby.SourceNodesArgs,
  pluginOptions: PluginOptions,
) =>
  pipe(
    await RTE.run(
      sourceNodesProgram,
      buildDependencies(gatsbyContext, pluginOptions),
    ),
    E.fold(E.throwError, constVoid),
  )

/**
 * To be executed in the `sourceNodes` stage.
 */
const sourceNodesProgram: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainW(
    RTE.fromPredicate(
      (deps) =>
        Boolean(deps.webhookBody && JSON.stringify(deps.webhookBody) !== '{}'),
      constVoid,
    ),
  ),
  RTE.fold(
    () => sourceNodesForAllDocuments,
    () => onWebhook,
  ),
)
