import * as gatsby from 'gatsby'

import { pascalCase } from './pascalCase'

interface Dependencies {
  typePrefix: string
  createNodeId: gatsby.SourceNodesArgs['createNodeId']
  createContentDigest: gatsby.SourceNodesArgs['createContentDigest']
}

type IdentifablePartialNode = Partial<gatsby.Node> & Pick<gatsby.Node, 'id'>

export interface NodeHelpers {
  generateTypeName: (...parts: string[]) => string
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifablePartialNode) => gatsby.NodeInput
}

export const createNodeHelpers = ({
  typePrefix,
  createNodeId,
  createContentDigest,
}: Dependencies): NodeHelpers => {
  const generateTypeName = (...parts: string[]): string =>
    pascalCase(typePrefix, ...parts)

  const createNodeFactory = (...nameParts: string[]) => (
    node: IdentifablePartialNode,
  ): gatsby.NodeInput => ({
    ...node,
    id: createNodeId(node.id),
    internal: {
      type: generateTypeName(...nameParts),
      contentDigest: createContentDigest(node),
      ...node.internal,
    },
  })

  return {
    generateTypeName,
    createNodeFactory,
  }
}
