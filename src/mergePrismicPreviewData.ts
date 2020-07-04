import { Node } from 'gatsby'
import isPlainObject from 'lodash.isplainobject'

import { NodeTree } from './types'

// Root node field used to compare static data with preview data. If values are
// equal, the preview node can be treated as an updated version of the static
// node.
const PREVIEWABLE_NODE_ID_FIELD = 'prismicId'

const traverseAndReplace = (node: any, replacementNode: Node): any => {
  if (isPlainObject(node)) {
    // If the nodes share an ID, replace it.
    if (
      node[PREVIEWABLE_NODE_ID_FIELD] ===
      replacementNode[PREVIEWABLE_NODE_ID_FIELD]
    )
      return replacementNode

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

export enum MergePrismicPreviewDataStrategy {
  /** Traverse static data nodes and replace with preview data if IDs match. */
  TraverseAndReplace = 'traverseAndReplace',
  /** Replace or insert preview data at the root level */
  RootReplaceOrInsert = 'rootReplaceOrInsert',
}

interface MergePrismicPreviewDataArgs {
  staticData?: NodeTree
  previewData?: NodeTree
  strategy?: MergePrismicPreviewDataStrategy
}

/**
 * Merges preview data with static data. Different merge strategies can be used
 * for different environments.
 */
export const mergePrismicPreviewData = ({
  staticData,
  previewData,
  strategy = MergePrismicPreviewDataStrategy.TraverseAndReplace,
}: MergePrismicPreviewDataArgs): NodeTree | undefined => {
  if (!staticData && !previewData) return
  if (!staticData) return previewData
  if (!previewData) return staticData

  switch (strategy) {
    // Unpublished previews must return data at the root to ensure it is always
    // available. If staticData and previewData share root-level keys, they are
    // merged. Otherwise, data will be sibilings.
    case MergePrismicPreviewDataStrategy.RootReplaceOrInsert:
      return { ...staticData, ...previewData }

    // Traverse static data nodes and replace with preview data if IDs match.
    case MergePrismicPreviewDataStrategy.TraverseAndReplace:
    default: {
      const previewDataRootNodeKey = Object.keys(previewData)[0]

      // TODO: Remove in v4.0.0.
      if (
        staticData.hasOwnProperty(previewDataRootNodeKey) &&
        !staticData[previewDataRootNodeKey][PREVIEWABLE_NODE_ID_FIELD]
      ) {
        // TODO: Add link to more details on @previewable.
        console.warn(
          'Warning: Merging preview data implicitly will be deprecated in gatsby-source-prismic v4.0.0.\n\nIf you are relying on this functionality, please update your GraphQL query to include the @previewable directive on nodes that should be previewable.\n\nSee <URL HERE> for more details.',
        )
        return { ...staticData, ...previewData }
      }

      return traverseAndReplace(staticData, previewData[previewDataRootNodeKey])
    }
  }
}
