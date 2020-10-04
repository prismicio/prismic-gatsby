import * as gatsby from 'gatsby'

import { pascalCase } from './pascalCase'
import { camelCase } from './camelCase'

interface CreateNodeHelpersParams {
  /** Prefix for all nodes. Used as a namespace for node type names. */
  typePrefix: string
  /**
   * Prefix for field names. Used as a namespace for fields that conflict with
   * Gatsby's reserved field names (`id` and `internal`).
   * */
  fieldPrefix?: string
  /** Gatsby's `createNodeId` helper. */
  createNodeId: gatsby.SourceNodesArgs['createNodeId']
  /** Gatsby's `createContentDigest` helper. */
  createContentDigest: gatsby.SourceNodesArgs['createContentDigest']
}

/**
 * A record that can be globally identified using a combination of `id` and
 * `type` fields.
 */
export interface IdentifiableRecord {
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Gatsby node helper functions to aid node creation.
 */
export interface NodeHelpers {
  /**
   * Creates a namespaced type name in Pascal case. Nodes created using a
   * `createNodeFactory` function will automatically be namespaced using this
   * function.
   *
   * @param parts Parts of the type name. If more than one string is provided,
   * they will be concatenated in Pascal case.
   *
   * @return Namespaced type name.
   */
  createTypeName: (...parts: string[]) => string
  /**
   * Creates a namespaced field name in camel case. Nodes created using a
   * `createNodeFactory` function will automatically have namespaced fields
   * using this function ONLY if the name conflicts with Gatsby's reserved
   * fields (`id` and `internal`).
   *
   * @param parts Parts of the field name. If more than one string is provided,
   * they will be concatenated in camel case.
   *
   * @return Namespaced field name.
   */
  createFieldName: (...parts: string[]) => string
  /**
   * Creates a deterministic node ID based on the `typePrefix` option provided
   * to `createNodeHelpers` and the provided `parts` argument. Providing the
   * same `parts` will always return the same result.
   *
   * @param parts Strings to globally identify a node within the domain of the
   * node helpers.
   *
   * @return Node ID based on the provided `parts`.
   */
  createNodeId: (...parts: string[]) => string
  /**
   * Creates a function that will convert an identifiable record (one that has
   * an `id` and `type` field) to a valid input for Gatsby's `createNode`
   * action.
   *
   * @param nameParts Parts of the type name for the resulting factory. All
   * records called with the resulting function will have a type name based on
   * this parameter.
   *
   * @return A function that converts an identifiable record to a valid input
   * for Gatsby's `createNode` action.
   */
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifiableRecord) => gatsby.NodeInput
}

/**
 * Creates Gatsby node helper functions to aid node creation.
 */
export const createNodeHelpers = ({
  typePrefix,
  fieldPrefix = typePrefix,
  createNodeId: gatsbyCreateNodeId,
  createContentDigest: gatsbyCreateContentDigest,
}: CreateNodeHelpersParams): NodeHelpers => {
  const createTypeName = (...parts: string[]): string =>
    pascalCase(typePrefix, ...parts)

  const createFieldName = (...parts: string[]): string =>
    camelCase(fieldPrefix, ...parts)

  const createNodeId = (...parts: string[]): string =>
    gatsbyCreateNodeId(
      [typePrefix, ...parts].filter((p) => p != null).join(' '),
    )

  const createNodeFactory = (...nameParts: string[]) => (
    node: IdentifiableRecord,
  ): gatsby.NodeInput => ({
    ...node,
    id: createNodeId(node.id),
    [createFieldName('id')]: node.id,
    internal: {
      type: createTypeName(...nameParts),
      contentDigest: gatsbyCreateContentDigest(node),
    },
    [createFieldName('internal')]: node.internal,
  })

  return {
    createTypeName,
    createFieldName,
    createNodeId,
    createNodeFactory,
  }
}
