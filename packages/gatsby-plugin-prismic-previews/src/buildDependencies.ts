import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import md5 from 'md5'
import {
  GLOBAL_TYPE_PREFIX,
  BROWSER_CREATE_NODE_ID_TEMPLATE,
} from 'gatsby-source-prismic/dist/constants'
import { createNodeHelpers } from 'gatsby-source-prismic/dist/lib/nodeHelpers'
import { sprintf } from 'gatsby-source-prismic/dist/lib/sprintf'
import { Dependencies, PluginOptions } from 'gatsby-source-prismic/dist/types'

import {
  PrismicContextAction,
  PrismicContextActionType,
  PrismicContextState,
} from './usePrismicContext'

const createCache = (): gatsby.GatsbyCache => {
  const map = new Map()

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (key: string): Promise<any> => Promise.resolve(map.get(key)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any): Promise<any> => {
      map.set(key, value)

      return Promise.resolve(value)
    },
  }
}

const createNodeId = (input: string): string =>
  md5(sprintf(BROWSER_CREATE_NODE_ID_TEMPLATE, input))

const createContentDigest = (input: unknown): string =>
  md5(JSON.stringify(input))

export const buildDependencies = (
  state: PrismicContextState,
  dispatch: (action: PrismicContextAction) => void,
  pluginOptions: PluginOptions,
): Dependencies => ({
  pluginOptions,
  createNode: (node: gatsby.NodeInput): void =>
    dispatch({
      type: PrismicContextActionType.CreateNode,
      payload: node,
    }),
  createTypes: (type: gatsby.GatsbyGraphQLObjectType): void =>
    dispatch({
      type: PrismicContextActionType.CreateType,
      payload: type,
    }),
  getNode: (id: string) => state.nodes[id] as gatsby.Node,
  getNodes: () => Object.values(state.nodes) as gatsby.Node[],
  touchNode: () => void 0,
  deleteNode: ({ node }: { node: gatsby.Node }): void =>
    dispatch({
      type: PrismicContextActionType.DeleteNode,
      payload: node,
    }),
  reportInfo: console.log,
  reportWarning: console.warn,
  buildUnionType: (
    config: gqlc.ComposeUnionTypeConfig<unknown, unknown>,
  ): gatsby.GatsbyGraphQLUnionType => ({
    kind: 'UNION',
    config,
  }),
  buildObjectType: (
    config: gqlc.ComposeObjectTypeConfig<unknown, unknown>,
  ): gatsby.GatsbyGraphQLObjectType => ({
    kind: 'OBJECT',
    config,
  }),
  buildEnumType: (
    config: gqlc.ComposeEnumTypeConfig,
  ): gatsby.GatsbyGraphQLEnumType => ({
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
