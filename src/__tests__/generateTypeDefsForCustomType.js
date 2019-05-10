import util from 'util'
import * as R from 'ramda'

import {
  generateTypeDefsForCustomType,
  generateTypeDefForLinkType,
  resolvePathToArray,
} from '../generateTypeDefsForCustomType'
import customTypeSchema from './fixtures/customTypeSchema.json'
import customTypeTypeDefs from './fixtures/customTypeTypeDefs.json'

const prettyLog = x => console.log(util.inspect(x, false, null, true))

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
  const result = generateTypeDefsForCustomType({
    customTypeId,
    customTypeJson: customTypeSchema,
    gatsbyContext: { schema },
    pluginOptions: {},
  })

  describe('return value typeDefs', () => {
    const { typeDefs } = result

    test('is a list of type definitions', () => {
      expect(Array.isArray(result.typeDefs)).toBe(true)
    })

    test.skip('return value includes type definitions for all types and subtypes', () => {
      customTypeTypeDefs.forEach(typeDef => {
        expect(result).toContainEqual(typeDef)
      })
    })

    test.skip('PrismicStructuredTextType resolver returns HTML and text values', () => {
      // Implement
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

      const resolverResult = resolver(parent, undefined, context)

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

      const resolverResult = resolver(parent, undefined, context, info)

      expect(context.nodeModel.getNodesByIds).toHaveBeenCalledWith({
        ids: ['id1', 'id2'],
      })
    })
  })

  describe('return value typePaths', () => {
    test('returns a list of type paths', () => {
      expect(Array.isArray(result.typePaths)).toBe(true)
    })
  })
})

describe('generateTypeDefForLinkType', () => {
  test('returns PrismicAllDocumentTypes definition including all PrismicDocument types', () => {
    const result = generateTypeDefForLinkType(customTypeTypeDefs, schema)

    expect(schema.buildUnionType).toHaveBeenCalledWith({
      name: 'PrismicAllDocumentTypes',
      types: ['PrismicMyCustomType'],
    })
  })
})
