import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import md5 from 'md5'

import { Dependencies, PluginOptions } from 'shared/types'
import {
  GLOBAL_TYPE_PREFIX,
  BROWSER_CREATE_NODE_ID_TEMPLATE,
} from 'shared/constants'
import { createNodeHelpers } from 'shared/lib/nodeHelpers'
import { sprintf } from 'shared/lib/sprintf'

import { PrismicContextAction, PrismicContextActionType } from './context'

const createCache = () => {
  const map = new Map()

  return {
    get: (key: string) => Promise.resolve(map.get(key)),
    set: (key: string, value: any) => {
      map.set(key, value)
      return Promise.resolve(value)
    },
  }
}

const createNodeId = (input: string) =>
  md5(sprintf(BROWSER_CREATE_NODE_ID_TEMPLATE, input))

const createContentDigest = (input: unknown) => md5(JSON.stringify(input))

export const buildDependencies = (
  dispatch: (action: PrismicContextAction) => void,
  pluginOptions: PluginOptions,
): Dependencies => ({
  pluginOptions,
  createNode: (node: gatsby.NodeInput) =>
    dispatch({
      type: PrismicContextActionType.CreateNode,
      payload: node,
    }),
  createTypes: (type: gatsby.GatsbyGraphQLObjectType) =>
    dispatch({
      type: PrismicContextActionType.CreateType,
      payload: type,
    }),
  reportInfo: console.log,
  buildUnionType: (config: gqlc.ComposeUnionTypeConfig<unknown, unknown>) => ({
    kind: 'UNION',
    config,
  }),
  buildObjectType: (
    config: gqlc.ComposeObjectTypeConfig<unknown, unknown>,
  ) => ({
    kind: 'OBJECT',
    config,
  }),
  buildEnumType: (config: gqlc.ComposeEnumTypeConfig) => ({
    kind: 'ENUM',
    config,
  }),
  cache: createCache(),
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
