import { Node } from 'gatsby'
import isPlainObject from 'lodash.isplainobject'

import { NodeTree } from './types'

// Root node field used to compare static data with preview data. If values are
// equal, the preview node can be treated as an updated version of the static
// node.
const PREVIEWABLE_NODE_ID_FIELD = '_previewable'

// TODO: Remove in v4.0.0
// Same as PREVIEWABLE_NODE_ID_FIELD, but the legacy version that will be phased out in v4.0.0.
const LEGACY_PREVIEWABLE_NODE_ID_FIELD = 'prismicId'

const traverseAndReplace = (node: any, replacementNode: Node): any => {
  if (isPlainObject(node)) {
    // If the nodes share an ID, replace it.
    if (
      node[PREVIEWABLE_NODE_ID_FIELD] ===
      replacementNode[PREVIEWABLE_NODE_ID_FIELD]
    )
      return replacementNode

    // TODO: Remove in v4.0.0
    if (
      node[LEGACY_PREVIEWABLE_NODE_ID_FIELD] ===
      replacementNode[LEGACY_PREVIEWABLE_NODE_ID_FIELD]
    ) {
      console.warn(
        'Warning: Merging nested preview data using the prismicId field will be deprecated in gatsby-source-prismic v4.0.0.\n\nIf you are relying on this functionality, please update your GraphQL query to include the _previewable field on documents that should be previewable.',
      )
      return replacementNode
    }

    // We did not find the Node to replace. Iterate all properties and continue
    // to find the Node.
    const newNode: typeof node = {}
    for (const subnodeKey in node)
      newNode[subnodeKey] = traverseAndReplace(
        node[subnodeKey],
        replacementNode,
      )
    return newNode
  }

  // Iterate all elements in the node to find the Node.
  if (Array.isArray(node))
    return node.map((subnode) => traverseAndReplace(subnode, replacementNode))

  // If the node is not an object or array, it cannot be a Node.
  return node
}

export interface MergePrismicPreviewDataArgs {
  staticData?: NodeTree
  previewData?: NodeTree
  /**
   * Determines the method with which the function merges preview data into static data.
   *
   * - `traverseAndReplace`: Traverse static data nodes and replace with preview data if IDs match.
   * - `rootReplaceOrInsert`: Replace or insert preview data at the root level.
   */
  strategy?: 'traverseAndReplace' | 'rootReplaceOrInsert'
}

/**
 * Merges preview data with static data. Different merge strategies can be used
 * for different environments.
 */
export const mergePrismicPreviewData = ({
  staticData,
  previewData,
  strategy = 'traverseAndReplace',
}: MergePrismicPreviewDataArgs): NodeTree | undefined => {
  if (!staticData && !previewData) return
  if (!staticData) return previewData
  if (!previewData) return staticData

  switch (strategy) {
    // Unpublished previews must return data at the root to ensure it is always
    // available. If staticData and previewData share root-level keys, they are
    // merged. Otherwise, data will be sibilings.
    case 'rootReplaceOrInsert':
      return { ...staticData, ...previewData }

    // Traverse static data nodes and replace with preview data if IDs match.
    case 'traverseAndReplace':
    default: {
      const previewDataRootNodeKey = Object.keys(previewData)[0]

      // TODO: Remove in v4.0.0.
      if (
        staticData.hasOwnProperty(previewDataRootNodeKey) &&
        !staticData[previewDataRootNodeKey][PREVIEWABLE_NODE_ID_FIELD] &&
        !staticData[previewDataRootNodeKey][LEGACY_PREVIEWABLE_NODE_ID_FIELD]
      ) {
        // TODO: Add link to more details on _previewable.
        console.warn(
          'Warning: Merging preview data implicitly will be deprecated in gatsby-source-prismic v4.0.0.\n\nIf you are relying on this functionality, please update your GraphQL query to include the _previewable field on documents that should be previewable.',
        )
        return { ...staticData, ...previewData }
      }

      return traverseAndReplace(staticData, previewData[previewDataRootNodeKey])
    }
  }
}
