import { documentToNode } from '../documentToNode'
import { generateTypeDefsForCustomType } from '../generateTypeDefsForCustomType'
import document from './fixtures/document.json'
import documentNormalizedNodes from './fixtures/documentNormalizedNodes.json'
import customTypeJson from './fixtures/customTypeSchema.json'

const customTypeId = 'all_field_types'

const schema = {
  buildObjectType: config => ({ kind: 'OBJECT', config }),
  buildUnionType: config => ({ kind: 'UNION', config }),
}

const gatsbyContext = {
  createNodeId: () => 'result of createNodeId',
  createContentDigest: () => 'result of createContentDigest',
  schema,
}

const pluginOptions = {}

describe('documentToNode', () => {
  test.only('returns a list of normalized nodes to create', () => {
    const { typePaths } = generateTypeDefsForCustomType({
      customTypeId,
      customTypeJson,
      gatsbyContext,
      pluginOptions,
    })

    const result = documentToNode(document, {
      typePaths,
      gatsbyContext,
      pluginOptions,
    })

    expect(result).toEqual(documentNormalizedNodes)
  })
})
