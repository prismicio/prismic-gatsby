import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

import { GLOBAL_TYPE_PREFIX } from './constants'
import { Dependencies, PluginOptions } from './types'
import { createTypePathsStore } from './typePaths'

export const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs | gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
): Dependencies => {
  const typePathsStore = createTypePathsStore()

  return {
    pluginOptions,
    webhookBody: gatsbyContext.webhookBody,
    createTypePath: typePathsStore.set,
    getTypePath: typePathsStore.get,
    serializeTypePathStore: typePathsStore.serialize,
    createNode: gatsbyContext.actions.createNode,
    createTypes: gatsbyContext.actions.createTypes,
    touchNode: gatsbyContext.actions.touchNode,
    deleteNode: gatsbyContext.actions.deleteNode,
    createNodeId: gatsbyContext.createNodeId,
    reporter: gatsbyContext.reporter,
    reportInfo: gatsbyContext.reporter.info,
    reportWarning: gatsbyContext.reporter.warn,
    buildUnionType: gatsbyContext.schema.buildUnionType,
    buildObjectType: gatsbyContext.schema.buildObjectType,
    buildEnumType: gatsbyContext.schema.buildEnumType,
    getNode: gatsbyContext.getNode,
    getNodes: gatsbyContext.getNodes,
    store: gatsbyContext.store,
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
  }
}
