import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { sourceNodes as sourceNodesProgram } from './sourceNodes'
import { createNodeHelpers } from './lib/nodeHelpers'
import { GLOBAL_TYPE_PREFIX } from './constants'
import { PluginOptionsD } from 'decoders'

export const sourceNodes: NonNullable<
  gatsby.GatsbyNode['sourceNodes']
> = async (
  gatsbyContext: gatsby.SourceNodesArgs,
  unvalidatedPluginOptions: Record<string, unknown>,
) =>
  pipe(
    PluginOptionsD.decode(unvalidatedPluginOptions),
    E.fold(
      (error) => gatsbyContext.reporter.panic(new Error(D.draw(error))),
      (pluginOptions) =>
        RTE.run(sourceNodesProgram, {
          pluginOptions,
          globalNodeHelpers: createNodeHelpers({
            typePrefix: GLOBAL_TYPE_PREFIX,
            createNodeId: gatsbyContext.createNodeId,
            createContentDigest: gatsbyContext.createContentDigest,
          }),
          nodeHelpers: createNodeHelpers({
            typePrefix: `${GLOBAL_TYPE_PREFIX} ${pluginOptions.typePrefix}`,
            createNodeId: gatsbyContext.createNodeId,
            createContentDigest: gatsbyContext.createContentDigest,
          }),
          gatsbyCreateNode: gatsbyContext.actions.createNode,
          gatsbyCreateTypes: gatsbyContext.actions.createTypes,
          gatsbyReportInfo: gatsbyContext.reporter.info,
          gatsbyBuildUnionType: gatsbyContext.schema.buildUnionType,
          gatsbyBuildObjectType: gatsbyContext.schema.buildObjectType,
        }),
    ),
  )
