import * as R from 'ramda'

import {
  generateTypeDefsForCustomType,
  generateTypeDefsForLinkType,
} from '../generateTypeDefsForCustomType'
import schema from './fixtures/schema.json'
import typeDefs from './fixtures/typeDefs.json'

const gatsbySchema = {
  buildObjectType: config => ({ kind: 'OBJECT', config }),
  buildUnionType: config => ({ kind: 'UNION', config }),
}

const customTypeId = 'my_custom_type'

describe('generateTypeDefsForCustomType', () => {
  test('returns a list of type definitions to create for a given Prismic JSON schema', () => {
    const result = generateTypeDefsForCustomType(
      customTypeId,
      schema,
      gatsbySchema,
    )

    expect(result).toHaveLength(typeDefs.length)

    typeDefs.forEach(typeDef => {
      expect(result).toContainEqual(typeDef)
    })
  })
})

describe('generateTypeDefsForLinkType', () => {
  test('returns a list of link type definitions to create for a given Prismic JSON schema', () => {
    const result = generateTypeDefsForLinkType(typeDefs, gatsbySchema)

    expect(result).toContainEqual({
      kind: 'UNION',
      config: {
        name: 'PrismicAllDocumentTypes',
        types: ['PrismicMyCustomType'],
      },
    })

    expect(result).toContainEqual({
      kind: 'OBJECT',
      config: {
        name: 'PrismicLinkType',
        fields: {
          id: 'String',
          document: 'PrismicAllDocumentTypes',
        },
      },
    })
  })
})
