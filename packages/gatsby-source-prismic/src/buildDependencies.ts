import * as gatsby from 'gatsby'
import { createNodeHelpers } from 'gatsby-node-helpers'

import { GLOBAL_TYPE_PREFIX } from './constants'
import { Dependencies, PluginOptions } from './types'

/**
 * Build the dependencies used by functions throughout the plugin.
 *
 * This collection of dependencies is shared through the use of the
 * `fp-ts/Reader` monad.
 *
 * @see https://gcanti.github.io/fp-ts/modules/Reader.ts.html
 *
 * @param gatsbyContext Arguments provided to Gatsby's Node APIs.
 * @param pluginOptions The plugin instance's options.
 *
 * @returns Dependencies used throughout the plugin.
 */
export const buildDependencies = (
  gatsbyContext: gatsby.NodePluginArgs,
  pluginOptions: PluginOptions,
): Dependencies => ({
  pluginOptions,
  webhookBody: gatsbyContext.webhookBody,
  createNode: gatsbyContext.actions.createNode,
  createTypes: gatsbyContext.actions.createTypes,
  touchNode: gatsbyContext.actions.touchNode,
  deleteNode: gatsbyContext.actions.deleteNode,
  createNodeId: gatsbyContext.createNodeId,
  createContentDigest: gatsbyContext.createContentDigest,
  reporter: gatsbyContext.reporter,
  reportInfo: gatsbyContext.reporter.info,
  reportWarning: gatsbyContext.reporter.warn,
  buildUnionType: gatsbyContext.schema.buildUnionType,
  buildObjectType: gatsbyContext.schema.buildObjectType,
  buildEnumType: gatsbyContext.schema.buildEnumType,
  getNode: gatsbyContext.getNode,
  getNodes: gatsbyContext.getNodes,
  schema: gatsbyContext.schema,
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
})
