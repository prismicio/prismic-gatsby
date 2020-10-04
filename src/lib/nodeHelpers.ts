import * as gatsby from 'gatsby'

import { pascalCase } from './pascalCase'
import { camelCase } from './camelCase'

interface CreateNodeHelpersDependencies {
  typePrefix: string
  createNodeId: gatsby.SourceNodesArgs['createNodeId']
  createContentDigest: gatsby.SourceNodesArgs['createContentDigest']
}

export interface IdentifiableRecord {
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface NodeHelpers {
  generateTypeName: (...parts: string[]) => string
  generateFieldName: (...parts: string[]) => string
  createNodeId: (...parts: string[]) => string
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifiableRecord) => gatsby.NodeInput
}

export const createNodeHelpers = ({
  typePrefix,
  createNodeId: gatsbyCreateNodeId,
  createContentDigest: gatsbyCreateContentDigest,
}: CreateNodeHelpersDependencies): NodeHelpers => {
  const generateTypeName = (...parts: string[]): string =>
    pascalCase(typePrefix, ...parts)

  const generateFieldName = (...parts: string[]): string =>
    camelCase(typePrefix, ...parts)

  const createNodeId = (...parts: string[]): string =>
    gatsbyCreateNodeId(
      [typePrefix, ...parts].filter((p) => p != null).join(' '),
    )

  const createNodeFactory = (...nameParts: string[]) => (
    node: IdentifiableRecord,
  ): gatsby.NodeInput => ({
    ...node,
    id: createNodeId(node.id),
    [generateFieldName('id')]: node.id,
    internal: {
      type: generateTypeName(...nameParts),
      contentDigest: gatsbyCreateContentDigest(node),
    },
    [generateFieldName('id')]: node.internal,
  })

  return {
    generateTypeName,
    generateFieldName,
    createNodeId,
    createNodeFactory,
  }
}
