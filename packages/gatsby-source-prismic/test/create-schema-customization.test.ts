import { createNodeHelpers } from 'gatsby-node-helpers'

import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'

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
    'page.data.body.first_option': 'Slice',
    'page.data.body.first_option.items.first_option_repeat_boolean': 'Boolean',
    'page.data.body.first_option.items.first_option_repeat_color': 'Color',
    'page.data.body.first_option.items.first_option_repeat_content_relationship':
      'Link',
    'page.data.body.first_option.items.first_option_repeat_date': 'Date',
    'page.data.body.first_option.items.first_option_repeat_embed': 'Embed',
    'page.data.body.first_option.items.first_option_repeat_geopoint':
      'GeoPoint',
    'page.data.body.first_option.items.first_option_repeat_image': 'Image',
    'page.data.body.first_option.items.first_option_repeat_key_text': 'Text',
    'page.data.body.first_option.items.first_option_repeat_link': 'Link',
    'page.data.body.first_option.items.first_option_repeat_link_to_media':
      'Link',
    'page.data.body.first_option.items.first_option_repeat_number': 'Number',
    'page.data.body.first_option.items.first_option_repeat_rich_text':
      'StructuredText',
    'page.data.body.first_option.items.first_option_repeat_select': 'Select',
    'page.data.body.first_option.items.first_option_repeat_timestamp':
      'Timestamp',
    'page.data.body.first_option.items.first_option_repeat_title':
      'StructuredText',
    'page.data.body.first_option.primary.first_option_nonrepeat_boolean':
      'Boolean',
    'page.data.body.first_option.primary.first_option_nonrepeat_color': 'Color',
    'page.data.body.first_option.primary.first_option_nonrepeat_content_relationship':
      'Link',
    'page.data.body.first_option.primary.first_option_nonrepeat_date': 'Date',
    'page.data.body.first_option.primary.first_option_nonrepeat_embed': 'Embed',
    'page.data.body.first_option.primary.first_option_nonrepeat_geopoint':
      'GeoPoint',
    'page.data.body.first_option.primary.first_option_nonrepeat_image': 'Image',
    'page.data.body.first_option.primary.first_option_nonrepeat_key_text':
      'Text',
    'page.data.body.first_option.primary.first_option_nonrepeat_link': 'Link',
    'page.data.body.first_option.primary.first_option_nonrepeat_link_to_media':
      'Link',
    'page.data.body.first_option.primary.first_option_nonrepeat_number':
      'Number',
    'page.data.body.first_option.primary.first_option_nonrepeat_rich_text':
      'StructuredText',
    'page.data.body.first_option.primary.first_option_nonrepeat_select':
      'Select',
    'page.data.body.first_option.primary.first_option_nonrepeat_timestamp':
      'Timestamp',
    'page.data.body.first_option.primary.first_option_nonrepeat_title':
      'StructuredText',
    'page.data.body.second_option': 'Slice',
    'page.data.body.second_option.items.second_option_repeat_boolean':
      'Boolean',
    'page.data.body.second_option.items.second_option_repeat_color': 'Color',
    'page.data.body.second_option.items.second_option_repeat_content_relationship':
      'Link',
    'page.data.body.second_option.items.second_option_repeat_date': 'Date',
    'page.data.body.second_option.items.second_option_repeat_embed': 'Embed',
    'page.data.body.second_option.items.second_option_repeat_geopoint':
      'GeoPoint',
    'page.data.body.second_option.items.second_option_repeat_image': 'Image',
    'page.data.body.second_option.items.second_option_repeat_key_text': 'Text',
    'page.data.body.second_option.items.second_option_repeat_link': 'Link',
    'page.data.body.second_option.items.second_option_repeat_link_to_media':
      'Link',
    'page.data.body.second_option.items.second_option_repeat_number': 'Number',
    'page.data.body.second_option.items.second_option_repeat_rich_text':
      'StructuredText',
    'page.data.body.second_option.items.second_option_repeat_select': 'Select',
    'page.data.body.second_option.items.second_option_repeat_timestamp':
      'Timestamp',
    'page.data.body.second_option.items.second_option_repeat_title':
      'StructuredText',
    'page.data.body.second_option.primary.second_option_nonrepeat_boolean':
      'Boolean',
    'page.data.body.second_option.primary.second_option_nonrepeat_color':
      'Color',
    'page.data.body.second_option.primary.second_option_nonrepeat_content_relationship':
      'Link',
    'page.data.body.second_option.primary.second_option_nonrepeat_date': 'Date',
    'page.data.body.second_option.primary.second_option_nonrepeat_embed':
      'Embed',
    'page.data.body.second_option.primary.second_option_nonrepeat_geopoint':
      'GeoPoint',
    'page.data.body.second_option.primary.second_option_nonrepeat_image':
      'Image',
    'page.data.body.second_option.primary.second_option_nonrepeat_key_text':
      'Text',
    'page.data.body.second_option.primary.second_option_nonrepeat_link': 'Link',
    'page.data.body.second_option.primary.second_option_nonrepeat_link_to_media':
      'Link',
    'page.data.body.second_option.primary.second_option_nonrepeat_number':
      'Number',
    'page.data.body.second_option.primary.second_option_nonrepeat_rich_text':
      'StructuredText',
    'page.data.body.second_option.primary.second_option_nonrepeat_select':
      'Select',
    'page.data.body.second_option.primary.second_option_nonrepeat_timestamp':
      'Timestamp',
    'page.data.body.second_option.primary.second_option_nonrepeat_title':
      'StructuredText',
    'page.data.boolean': 'Boolean',
    'page.data.color': 'Color',
    'page.data.content_relationship': 'Link',
    'page.data.date': 'Date',
    'page.data.embed': 'Embed',
    'page.data.geopoint': 'GeoPoint',
    'page.data.group': 'Group',
    'page.data.group.group_boolean': 'Boolean',
    'page.data.group.group_color': 'Color',
    'page.data.group.group_content_relationship': 'Link',
    'page.data.group.group_date': 'Date',
    'page.data.group.group_embed': 'Embed',
    'page.data.group.group_geopoint': 'GeoPoint',
    'page.data.group.group_image': 'Image',
    'page.data.group.group_key_text': 'Text',
    'page.data.group.group_link': 'Link',
    'page.data.group.group_link_to_media': 'Link',
    'page.data.group.group_number': 'Number',
    'page.data.group.group_rich_text': 'StructuredText',
    'page.data.group.group_select': 'Select',
    'page.data.group.group_timestamp': 'Timestamp',
    'page.data.group.group_title': 'StructuredText',
    'page.data.image': 'Image',
    'page.data.key_text': 'Text',
    'page.data.link': 'Link',
    'page.data.link_to_media': 'Link',
    'page.data.number': 'Number',
    'page.data.rich_text': 'StructuredText',
    'page.data.second_tab_body': 'Slices',
    'page.data.second_tab_body.second_tab_first_option': 'Slice',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_boolean':
      'Boolean',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_color':
      'Color',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_content_relationship':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_date':
      'Date',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_embed':
      'Embed',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_geopoint':
      'GeoPoint',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_image':
      'Image',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_key_text':
      'Text',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_link':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_link_to_media':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_number':
      'Number',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_rich_text':
      'StructuredText',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_select':
      'Select',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_timestamp':
      'Timestamp',
    'page.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_title':
      'StructuredText',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_boolean':
      'Boolean',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_color':
      'Color',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_content_relationship':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_date':
      'Date',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_embed':
      'Embed',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_geopoint':
      'GeoPoint',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_image':
      'Image',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_key_text':
      'Text',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_link':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_link_to_media':
      'Link',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_number':
      'Number',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_rich_text':
      'StructuredText',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_select':
      'Select',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_timestamp':
      'Timestamp',
    'page.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_title':
      'StructuredText',
    'page.data.second_tab_body.second_tab_second_option': 'Slice',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_boolean':
      'Boolean',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_color':
      'Color',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_content_relationship':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_date':
      'Date',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_embed':
      'Embed',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_geopoint':
      'GeoPoint',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_image':
      'Image',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_key_text':
      'Text',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_link':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_link_to_media':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_number':
      'Number',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_rich_text':
      'StructuredText',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_select':
      'Select',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_timestamp':
      'Timestamp',
    'page.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_title':
      'StructuredText',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_boolean':
      'Boolean',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_color':
      'Color',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_content_relationship':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_date':
      'Date',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_embed':
      'Embed',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_geopoint':
      'GeoPoint',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_image':
      'Image',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_key_text':
      'Text',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_link':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_link_to_media':
      'Link',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_number':
      'Number',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_rich_text':
      'StructuredText',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_select':
      'Select',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_timestamp':
      'Timestamp',
    'page.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_title':
      'StructuredText',
    'page.data.second_tab_boolean': 'Boolean',
    'page.data.second_tab_color': 'Color',
    'page.data.second_tab_content_relationship': 'Link',
    'page.data.second_tab_date': 'Date',
    'page.data.second_tab_embed': 'Embed',
    'page.data.second_tab_geopoint': 'GeoPoint',
    'page.data.second_tab_group': 'Group',
    'page.data.second_tab_group.second_tab_group_boolean': 'Boolean',
    'page.data.second_tab_group.second_tab_group_color': 'Color',
    'page.data.second_tab_group.second_tab_group_content_relationship': 'Link',
    'page.data.second_tab_group.second_tab_group_date': 'Date',
    'page.data.second_tab_group.second_tab_group_embed': 'Embed',
    'page.data.second_tab_group.second_tab_group_geopoint': 'GeoPoint',
    'page.data.second_tab_group.second_tab_group_image': 'Image',
    'page.data.second_tab_group.second_tab_group_key_text': 'Text',
    'page.data.second_tab_group.second_tab_group_link': 'Link',
    'page.data.second_tab_group.second_tab_group_link_to_media': 'Link',
    'page.data.second_tab_group.second_tab_group_number': 'Number',
    'page.data.second_tab_group.second_tab_group_rich_text': 'StructuredText',
    'page.data.second_tab_group.second_tab_group_select': 'Select',
    'page.data.second_tab_group.second_tab_group_timestamp': 'Timestamp',
    'page.data.second_tab_group.second_tab_group_title': 'StructuredText',
    'page.data.second_tab_image': 'Image',
    'page.data.second_tab_key_text': 'Text',
    'page.data.second_tab_link': 'Link',
    'page.data.second_tab_link_to_media': 'Link',
    'page.data.second_tab_number': 'Number',
    'page.data.second_tab_rich_text': 'StructuredText',
    'page.data.second_tab_select': 'Select',
    'page.data.second_tab_timestamp': 'Timestamp',
    'page.data.second_tab_title': 'StructuredText',
    'page.data.select': 'Select',
    'page.data.timestamp': 'Timestamp',
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
