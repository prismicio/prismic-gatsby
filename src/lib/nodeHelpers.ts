import * as gatsby from 'gatsby'

import { pascalCase } from './pascalCase'
import { camelCase } from './camelCase'

interface CreateNodeHelpersDependencies {
  typePrefix: string
  fieldPrefix?: string
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
  createTypeName: (...parts: string[]) => string
  createFieldName: (...parts: string[]) => string
  createNodeId: (...parts: string[]) => string
  createNodeFactory: (
    ...nameParts: string[]
  ) => (node: IdentifiableRecord) => gatsby.NodeInput
}

export const createNodeHelpers = ({
  typePrefix,
  fieldPrefix = typePrefix,
  createNodeId: gatsbyCreateNodeId,
  createContentDigest: gatsbyCreateContentDigest,
}: CreateNodeHelpersDependencies): NodeHelpers => {
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
