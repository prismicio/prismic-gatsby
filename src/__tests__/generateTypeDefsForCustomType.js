import * as R from 'ramda'

import {
  generateTypeDefsForCustomType,
  generateTypeDefForLinkType,
} from '../generateTypeDefsForCustomType'
import customTypeSchema from './fixtures/customTypeSchema.json'
import customTypeTypeDefs from './fixtures/customTypeTypeDefs.json'

const customTypeId = 'my_custom_type'

const schema = {
  buildObjectType: jest
    .fn()
    .mockImplementation(config => ({ kind: 'OBJECT', config })),
  buildUnionType: jest
    .fn()
    .mockImplementation(config => ({ kind: 'UNION', config })),
}

afterEach(() => {
  schema.buildObjectType.mockReset()
  schema.buildUnionType.mockReset()
})

describe('generateTypeDefsForCustomType', () => {
  const result = generateTypeDefsForCustomType(customTypeId, customTypeSchema, {
    gatsbyContext: { schema },
    pluginOptions: {},
  })

  describe('return value typeDefs', () => {
    const { typeDefs } = result

    test('is a list of type definitions', () => {
      expect(Array.isArray(typeDefs)).toBe(true)
    })

    test.skip('return value includes type definitions for all types and subtypes', () => {
      customTypeTypeDefs.forEach(typeDef => {
        expect(result).toContainEqual(typeDef)
      })
    })

    test.skip('PrismicLinkType document field resolver gets document node by ID', () => {
      const resolver = R.pipe(
        R.find(R.pathEq(['config', 'name'], 'PrismicLinkType')),
        R.path(['config', 'fields', 'document', 'resolve']),
      )(result)

      const parent = {
        id: 'id',
        type: 'my_custom_type',
      }

      const context = {
        nodeModel: {
          getNodeById: jest.fn(),
        },
      }

      resolver(parent, undefined, context)

      expect(context.nodeModel.getNodeById).toHaveBeenCalledWith({
        id: parent.id,
        type: 'PrismicMyCustomType',
      })
    })

    test('slices field resolver gets slice nodes by IDs', () => {
      const resolver = R.pipe(
        R.find(R.pathEq(['config', 'name'], 'PrismicMyCustomTypeData')),
        R.path(['config', 'fields', 'body', 'resolve']),
      )(result.typeDefs)

      const parent = {
        body: ['id1', 'id2'],
      }

      const context = {
        nodeModel: {
          getNodesByIds: jest.fn(),
        },
      }

      const info = { path: { key: 'body' } }

      resolver(parent, undefined, context, info)

      expect(context.nodeModel.getNodesByIds).toHaveBeenCalledWith({
        ids: ['id1', 'id2'],
      })
    })
  })

  describe('return value typePaths', () => {
    const { typePaths } = result

    test('returns a list of type paths', () => {
      expect(Array.isArray(typePaths)).toBe(true)
    })
  })
})

describe('generateTypeDefForLinkType', () => {
  test('returns PrismicAllDocumentTypes definition including all PrismicDocument types', () => {
    generateTypeDefForLinkType(customTypeTypeDefs, schema)

    expect(schema.buildUnionType).toHaveBeenCalledWith({
      name: 'PrismicAllDocumentTypes',
      types: ['PrismicMyCustomType'],
    })
  })
})
