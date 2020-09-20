import * as gatsby from 'gatsby'

import { pascalCase } from './pascalCase'

interface CreateNodeHelpersDependencies {
  typePrefix: string
  createNodeId: gatsby.SourceNodesArgs['createNodeId']
  createContentDigest: gatsby.SourceNodesArgs['createContentDigest']
}

export interface IdentifiableRecord {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface NodeHelpers {
  generateTypeName: (...parts: string[]) => string
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifiableRecord) => gatsby.NodeInput
}

export const createNodeHelpers = ({
  typePrefix,
  createNodeId,
  createContentDigest,
}: CreateNodeHelpersDependencies): NodeHelpers => {
  const generateTypeName = (...parts: string[]): string =>
    pascalCase(typePrefix, ...parts)

  const createNodeFactory = (...nameParts: string[]) => (
    node: IdentifiableRecord,
  ): gatsby.NodeInput => ({
    ...node,
    id: createNodeId(node.id),
    internal: {
      type: generateTypeName(...nameParts),
      contentDigest: createContentDigest(node),
    },
  })

  return { generateTypeName, createNodeFactory }
}
