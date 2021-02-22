import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'

import { sourceNodesForAllDocuments } from './lib/sourceNodesForAllDocuments'
import { throwError } from './lib/throwError'

import { Dependencies, PluginOptions } from './types'
import { buildDependencies } from './buildDependencies'
import { onWebhook } from './on-webhook'

/**
 * To be executed in the `sourceNodes` API.
 */
const sourceNodesProgram: RTE.ReaderTaskEither<
  Dependencies,
  Error,
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

/**
 * Extension point to tell plugins to source nodes.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#sourceNodes
 */
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
    E.fold(throwError, constVoid),
  )
