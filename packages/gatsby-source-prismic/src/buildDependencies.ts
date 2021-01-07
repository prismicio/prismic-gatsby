import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

import { GLOBAL_TYPE_PREFIX } from './constants'
import {
  Dependencies,
  PluginOptions,
  PrismicTypePathType,
  TypePathsStore,
} from './types'
import { serializePath } from './lib/serializePath'

const createTypePath = (store: TypePathsStore) => (
  path: string[],
  type: PrismicTypePathType,
): void => {
  store[serializePath(path)] = type
}

export const buildDependencies = (
  gatsbyContext: gatsby.SourceNodesArgs | gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
): Dependencies => {
  const typePathsStore = {}

  return {
    pluginOptions,
    webhookBody: gatsbyContext.webhookBody,
    typePathsStore,
    createTypePath: createTypePath(typePathsStore),
    createNode: gatsbyContext.actions.createNode,
    createTypes: gatsbyContext.actions.createTypes,
    touchNode: gatsbyContext.actions.touchNode,
    deleteNode: gatsbyContext.actions.deleteNode,
    reportInfo: gatsbyContext.reporter.info,
    reportWarning: gatsbyContext.reporter.warn,
    buildUnionType: gatsbyContext.schema.buildUnionType,
    buildObjectType: gatsbyContext.schema.buildObjectType,
    buildEnumType: gatsbyContext.schema.buildEnumType,
    getNode: gatsbyContext.getNode,
    getNodes: gatsbyContext.getNodes,
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
