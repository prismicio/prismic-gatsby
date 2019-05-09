import * as R from 'ramda'

import {
  generateTypeDefsForCustomType,
  generateTypeDefsForLinkType,
  resolvePathToArray,
} from '../generateTypeDefsForCustomType'
import customTypeSchema from './fixtures/customTypeSchema.json'
import customTypeTypeDefs from './fixtures/customTypeTypeDefs.json'

const customTypeId = 'my_custom_type'

const schema = {
  buildObjectType: config => ({ kind: 'OBJECT', config }),
  buildUnionType: config => ({ kind: 'UNION', config }),
}

const context = {
  nodeModel: {
    getNodeById: jest.fn(),
    getNodesByIds: jest.fn(),
  },
}

afterEach(() => {
  context.nodeModel.getNodeById.mockReset()
  context.nodeModel.getNodesByIds.mockReset()
})

describe('resolvePathToArray', () => {
  test.only('returns a list of paths', () => {
    const result = resolvePathToArray({
      key: 'title',
      prev: {
        key: 'data',
        prev: {
          key: 'node',
          prev: {
            key: 0,
            prev: {
              key: 'edges',
              prev: { key: 'allPrismicMyCustomType', prev: undefined },
            },
          },
        },
      },
    })

    expect(result).toEqual([
      'allPrismicMyCustomType',
      'edges',
      0,
      'node',
      'data',
      'title',
    ])
  })
})

describe('generateTypeDefsForCustomType', () => {
  const result = generateTypeDefsForCustomType({
    customTypeId,
    customTypeJson: customTypeSchema,
    gatsbyContext: { schema },
    pluginOptions: {},
  })

  test('returns a list of type definitions', () => {
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(customTypeTypeDefs.length)
  })

  test('return value includes type definitions for all types and subtypes', () => {
    customTypeTypeDefs.forEach(typeDef => {
      expect(result).toContainEqual(typeDef)
    })
  })

  test('slices field resolver gets slice nodes by IDs', () => {
    const resolver = R.pipe(
      R.find(R.pathEq(['config', 'name'], 'PrismicMyCustomTypeData')),
      R.path(['config', 'fields', 'body', 'resolve']),
    )(result)

    const parent = {
      data: {
        body: ['id1', 'id2'],
      },
    }

    const resolverResult = resolver(parent, undefined, context)

    expect(context.nodeModel.getNodesByIds).toHaveBeenCalledWith({
      ids: ['id1', 'id2'],
    })
  })
})

describe('generateTypeDefsForLinkType', () => {
  const result = generateTypeDefsForLinkType(customTypeTypeDefs, schema)

  test('returns a list of type definitions', () => {
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
  })

  test('return value includes PrismicLinkType object type using PrismicAllDocumentTypes', () => {
    expect(result).toContainEqual({
      kind: 'OBJECT',
      config: {
        name: 'PrismicLinkType',
        fields: {
          id: 'String',
          type: 'String',
          tags: '[String]',
          slug: 'String',
          uid: 'String',
          link_type: 'String',
          isBroken: 'Boolean',
          url: 'String',
          target: 'String',
          document: {
            type: 'PrismicAllDocumentTypes',
            resolve: expect.any(Function),
          },
        },
      },
    })
  })

  test('PrismicLinkType document field resolver gets document node by ID', () => {
    const resolver = R.pipe(
      R.find(R.pathEq(['config', 'name'], 'PrismicLinkType')),
      R.path(['config', 'fields', 'document', 'resolve']),
    )(result)

    const parent = {
      id: 'id',
      type: 'my_custom_type',
    }

    const resolverResult = resolver(parent, undefined, context)

    expect(context.nodeModel.getNodeById).toHaveBeenCalledWith({
      id: parent.id,
      type: 'PrismicMyCustomType',
    })
  })

  test('return value includes PrismicAllDocumentTypes union type', () => {
    expect(result).toContainEqual({
      kind: 'UNION',
      config: {
        name: 'PrismicAllDocumentTypes',
        types: ['PrismicMyCustomType'],
      },
    })
  })
})
