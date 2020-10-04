import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { PluginOptions, UnknownRecord } from './types'
import { GLOBAL_TYPE_PREFIX } from './constants'
import { PluginOptionsD } from './decoders'
import { sourceNodes as sourceNodesProgram } from './sourceNodes'
import { createNodeHelpers } from './lib/nodeHelpers'

const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs,
  pluginOptions: PluginOptions,
) => ({
  pluginOptions,
  createNode: gatsbyContext.actions.createNode,
  createTypes: gatsbyContext.actions.createTypes,
  reportInfo: gatsbyContext.reporter.info,
  buildUnionType: gatsbyContext.schema.buildUnionType,
  buildObjectType: gatsbyContext.schema.buildObjectType,
  buildEnumType: gatsbyContext.schema.buildEnumType,
  cache: gatsbyContext.cache,
  globalNodeHelpers: createNodeHelpers({
    typePrefix: GLOBAL_TYPE_PREFIX,
    createNodeId: gatsbyContext.createNodeId,
    createContentDigest: gatsbyContext.createContentDigest,
  }),
  nodeHelpers: createNodeHelpers({
    typePrefix: [GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
      .filter(Boolean)
      .join(' '),
    fieldPrefix: GLOBAL_TYPE_PREFIX,
    createNodeId: gatsbyContext.createNodeId,
    createContentDigest: gatsbyContext.createContentDigest,
  }),
})

export const sourceNodes: NonNullable<gatsby.GatsbyNode['sourceNodes']> = (
  gatsbyContext: gatsby.SourceNodesArgs,
  pluginOptions: UnknownRecord,
) =>
  pipe(
    PluginOptionsD.decode(pluginOptions),
    E.fold(
      (error) => gatsbyContext.reporter.panic(new Error(D.draw(error))),
      (pluginOptions) =>
        RTE.run(
          sourceNodesProgram,
          buildDependencies(gatsbyContext, pluginOptions),
        ),
    ),
  )
