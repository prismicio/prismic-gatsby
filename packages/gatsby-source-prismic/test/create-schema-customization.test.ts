import { createNodeHelpers } from 'gatsby-node-helpers'

import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'

// const util = await import('util')
// console.log(
//   util.inspect(
//     gatsbyContext.actions.createTypes.mock.calls
//       .filter((x) => /Thumbnail/.test(x[0].config.name))
//       .map((x) => x[0].config),
//     { depth: null, colors: true },
//   ),
// )

const nodeHelpers = createNodeHelpers({
  typePrefix: `Prismic ${pluginOptions.typePrefix}`,
  fieldPrefix: 'Prismic',
  createNodeId: gatsbyContext.createNodeId,
  createContentDigest: gatsbyContext.createContentDigest,
})

const findCreateTypesCall = (
  name: string,
  gatsbyCtx: typeof gatsbyContext = gatsbyContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any =>
  gatsbyCtx.actions.createTypes.mock.calls.find(
    (call) => call[0].config.name === name,
  )[0]

beforeEach(() => {
  jest.clearAllMocks()
  gatsbyContext.cache.clear()
})

test('creates type path nodes', async () => {
  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const calls = gatsbyContext.actions.createNode.mock.calls
    .filter((call) => call[0].internal.type === 'PrismicPrefixTypePathType')
    .reduce((acc, call) => {
      acc[call[0].path.join('.')] = call[0].type

      return acc
    }, {} as Record<string, string>)

  expect(calls).toEqual({
    page: 'Document',
    'page.data': 'DocumentData',
    'page.data.body': 'Slices',
    'page.data.body.images': 'Slice',
    'page.data.body.images.items.caption': 'StructuredText',
    'page.data.body.images.items.image': 'Image',
    'page.data.body.images.items.orientation': 'Boolean',
    'page.data.body.text': 'Slice',
    'page.data.body.text.primary.text': 'StructuredText',
    'page.data.main': 'Slices',
    'page.data.main.news_post': 'Slice',
    'page.data.main.news_post.primary.published_on': 'Date',
    'page.data.meta_description': 'Text',
    'page.data.meta_title': 'Text',
    'page.data.parent': 'Link',
    'page.data.title': 'StructuredText',
  })
})

describe('shared global types', () => {
  test('creates link types enum type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'ENUM',
        config: {
          name: 'PrismicLinkTypeEnum',
          values: { Any: {}, Document: {}, Media: {}, Web: {} },
        },
      }),
    )
  })

  test('creates image dimensions type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicImageDimensionsType',
          fields: { width: 'Int!', height: 'Int!' },
        },
      }),
    )
  })

  test('creates geopoint type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicGeoPointType',
          fields: { longitude: 'Int!', latitude: 'Int!' },
        },
      }),
    )
  })

  test('create image thumbnail type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixImageThumbnailType',
        fields: {
          alt: 'String',
          copyright: 'String',
          dimensions: 'PrismicImageDimensionsType',
          url: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          fixed: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          fluid: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          localFile: {
            type: 'File',
            resolve: expect.any(Function),
          },
        },
      },
    })
  })
})

describe('document', () => {
  test('includes base fields', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            uid: { type: 'UID' },
            foo: { type: 'Text' },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixPage',
        fields: {
          uid: 'String!',
          prismicId: 'ID!',
          data: 'PrismicPrefixPageDataType',
          dataRaw: { type: 'JSON!', resolve: expect.any(Function) },
          first_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          href: 'String!',
          lang: 'String!',
          last_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          tags: '[String!]!',
          type: 'String!',
          url: { type: 'String', resolve: expect.any(Function) },
          _previewable: { type: 'ID!', resolve: expect.any(Function) },
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      },
    })
  })

  test('dataRaw field resolves to raw data object', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixPage')
    const doc = { id: 'id', data: { foo: 'bar' } }
    const node = nodeHelpers.createNodeFactory('type')(doc)
    const resolver = call.config.fields.dataRaw.resolve

    expect(resolver(node)).toBe(doc.data)
  })

  test('url field resolves using linkResolver', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixPage')
    const node = nodeHelpers.createNodeFactory('type')({ id: 'id' })
    const resolver = call.config.fields.url.resolve

    expect(resolver(node)).toBe('linkResolver')
  })

  test('_previewable field resolves to Prismic ID', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixPage')
    const resolver = call.config.fields._previewable.resolve
    const node = nodeHelpers.createNodeFactory('type')({ id: 'id' })

    expect(resolver(node)).toBe(node.prismicId)
  })

  test('data field type includes all data fields', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            uid: { type: 'UID' },
            boolean: { type: 'Boolean' },
            color: { type: 'Color' },
            date: { type: 'Date' },
            embed: { type: 'Embed' },
            geo_point: { type: 'GeoPoint' },
            image: { type: 'Image' },
            link: { type: 'Link' },
            number: { type: 'Number' },
            select: { type: 'Select' },
            structured_text: { type: 'StructuredText' },
            text: { type: 'Text' },
            timestamp: { type: 'Timestamp' },
            group: { type: 'Group', config: { fields: { foo: 'Text' } } },
            slices: {
              type: 'Slices',
              config: {
                choices: {
                  foo: {
                    type: 'Slice',
                    repeat: {},
                    'non-repeat': {},
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixPageDataType',
        fields: {
          boolean: 'Boolean',
          color: 'String',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: 'PrismicEmbedType',
          geo_point: 'PrismicGeoPointType',
          group: '[PrismicPrefixPageDataGroup]',
          image: 'PrismicPrefixPageDataImageImageType',
          link: 'PrismicPrefixLinkType',
          number: 'Float',
          select: 'String',
          slices: '[PrismicPrefixPageDataSlicesSlicesType]',
          structured_text: 'PrismicPrefixStructuredTextType',
          text: 'String',
          timestamp: { type: 'Date', extensions: { dateformat: {} } },
        },
      },
    })
  })
})

describe('link fields', () => {
  test('creates link type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Link' },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicPrefixLinkType',
          fields: {
            link_type: 'PrismicLinkTypeEnum',
            isBroken: 'Boolean',
            url: { type: 'String', resolve: expect.any(Function) },
            target: 'String',
            size: 'Int',
            id: 'ID',
            type: 'String',
            tags: '[String]',
            lang: 'String',
            slug: 'String',
            uid: 'String',
            document: {
              type: 'PrismicPrefixAllDocumentTypes',
              resolve: expect.any(Function),
              extensions: { link: {} },
            },
            localFile: {
              type: 'File',
              resolve: expect.any(Function),
            },
            raw: { type: 'JSON', resolve: expect.any(Function) },
          },
        },
      }),
    )
  })

  test('localFile field resolves to remote node if link type is Media and url is present', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Link' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixLinkType')
    const field = { url: 'url', link_type: 'Media' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res.id).toBe('remoteFileNodeId')
  })

  test('localFile field resolves to null if link type is Media and url is not present', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Link' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixLinkType')
    const field = { url: null, link_type: 'Media' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBe(null)
  })

  test('localFile field resolves to null if link type is not Media', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Link' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixLinkType')
    const field = { url: 'url', link_type: 'Document' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBe(null)
  })
})

describe('structured text fields', () => {
  test('creates structured text type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'StructuredText' },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicPrefixStructuredTextType',
          fields: {
            text: { type: 'String', resolve: expect.any(Function) },
            html: { type: 'String', resolve: expect.any(Function) },
            raw: { type: 'JSON', resolve: expect.any(Function) },
          },
        },
      }),
    )
  })
})

describe('image fields', () => {
  test('creates field-specific image type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixPageDataFooImageType',
        fields: expect.objectContaining({
          alt: 'String',
          copyright: 'String',
          dimensions: 'PrismicImageDimensionsType',
          url: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          fixed: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          fluid: expect.objectContaining({
            type: expect.anything(),
            resolve: expect.any(Function),
          }),
          localFile: {
            type: 'File',
            resolve: expect.any(Function),
          },
        }),
      },
    })
  })

  test('creates field-specific thumbnail types', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: {
              type: 'Image',
              config: {
                thumbnails: [{ name: 'Mobile', width: '1000' }],
              },
            },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: expect.objectContaining({
        name: 'PrismicPrefixPageDataFooImageType',
        fields: expect.objectContaining({
          thumbnails: 'PrismicPrefixPageDataFooImageThumbnailsType',
        }),
      }),
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixPageDataFooImageThumbnailsType',
        fields: {
          Mobile: 'PrismicPrefixImageThumbnailType',
        },
      },
    })
  })

  test('localFile field resolves to remote node if image is present', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixPageDataFooImageType')
    const field = { url: 'url' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res.id).toBe('remoteFileNodeId')
  })

  test('localFile field resolves to null if image is not present', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        page: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixPageDataFooImageType')
    const field = { url: null }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBe(null)
  })
})
