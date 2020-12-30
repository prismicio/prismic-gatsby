import * as gatsby from 'gatsby'
import {
  GLOBAL_TYPE_PREFIX,
  serializePath,
  sprintf,
} from 'gatsby-source-prismic'
import { createNodeHelpers } from 'gatsby-node-helpers'
import md5 from 'tiny-hashes/md5'

import { BROWSER_CREATE_NODE_ID_TEMPLATE } from './constants'
import { Dependencies, PluginOptions } from './types'
import {
  PrismicContextAction,
  PrismicContextActionType,
  PrismicContextState,
} from './usePrismicContext'

const createNodeId = (input: string): string =>
  md5(sprintf(BROWSER_CREATE_NODE_ID_TEMPLATE, input))

const createContentDigest = (input: unknown): string =>
  md5(JSON.stringify(input))

export const buildDependencies = (
  state: PrismicContextState,
  contextDispatch: (action: PrismicContextAction) => void,
  pluginOptions: PluginOptions,
): Dependencies => ({
  pluginOptions,
  createNode: (node: gatsby.NodeInput): void =>
    contextDispatch({
      type: PrismicContextActionType.CreateNode,
      payload: node,
    }),
  cache: new Map(),
  getNode: (id: string) => state.nodes[id],
  getFieldType: (path: string[]) => state.typePaths[serializePath(path)],
  reportInfo: console.log,
  reportWarning: console.warn,
  globalNodeHelpers: createNodeHelpers({
    typePrefix: GLOBAL_TYPE_PREFIX,
    createNodeId,
    createContentDigest,
  }),
  nodeHelpers: createNodeHelpers({
    typePrefix: [GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
      .filter(Boolean)
      .join(' '),
    fieldPrefix: GLOBAL_TYPE_PREFIX,
    createNodeId,
    createContentDigest,
  }),
})
