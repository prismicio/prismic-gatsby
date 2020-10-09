import * as gatsby from 'gatsby'

import { Dependencies, PluginOptions } from 'shared/types'
import { GLOBAL_TYPE_PREFIX } from 'shared/constants'
import { createNodeHelpers } from 'shared/lib/nodeHelpers'

export const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs,
  pluginOptions: PluginOptions,
): Dependencies => ({
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
