import isPlainObject from 'lodash.isplainobject'

import { Node } from 'gatsby'

interface NodeTree {
  [key: string]: Node
}

interface MergePrismicPreviewDataArgs {
  staticData?: { [key: string]: any }
  previewData?: NodeTree
}

const traverseAndReplace = (node: any, replacementNode: Node): any => {
  if (isPlainObject(node)) {
    // If the node shares the same Prismic ID, replace it.
    if (node.prismicId === replacementNode.prismicId) return replacementNode

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

export const mergePrismicPreviewData = (
  args: MergePrismicPreviewDataArgs,
): NodeTree | undefined => {
  const { staticData, previewData } = args

  if (!staticData && !previewData) return
  if (!staticData) return previewData
  if (!previewData) return staticData

  const previewDataRootNodeKey = Object.keys(previewData)[0]
  if (staticData.hasOwnProperty(previewDataRootNodeKey))
    return { ...staticData, ...previewData }

  return traverseAndReplace(staticData, previewData[previewDataRootNodeKey])
}
