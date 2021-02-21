import { createNodeHelpers } from 'gatsby-node-helpers'
import { PrismicFieldType } from '../src'

import { createSchemaCustomization } from '../src/gatsby-node'
import { gatsbyContext } from './__fixtures__/gatsbyContext'
import { pluginOptions } from './__fixtures__/pluginOptions'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

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
    kitchen_sink: 'Document',
    'kitchen_sink.data': 'DocumentData',
    'kitchen_sink.data.body': 'Slices',
    'kitchen_sink.data.body.first_option': 'Slice',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_boolean':
      'Boolean',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_color':
      'Color',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_content_relationship':
      'Link',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_date':
      'Date',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_embed':
      'Embed',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_image':
      'Image',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_key_text':
      'Text',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_link':
      'Link',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_link_to_media':
      'Link',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_number':
      'Number',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_select':
      'Select',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_title':
      'GeoPoint',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_boolean':
      'Boolean',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_color':
      'Color',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_content_relationship':
      'Link',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_date':
      'Date',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_embed':
      'Embed',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_image':
      'Image',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_key_text':
      'Text',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_link':
      'Link',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_link_to_media':
      'Link',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_number':
      'Number',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_title':
      'GeoPoint',
    'kitchen_sink.data.body.second_option': 'Slice',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_boolean':
      'Boolean',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_color':
      'Color',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_content_relationship':
      'Link',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_date':
      'Date',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_embed':
      'Embed',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_image':
      'Image',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_key_text':
      'Text',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_link':
      'Link',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_link_to_media':
      'Link',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_number':
      'Number',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_select':
      'Select',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_title':
      'GeoPoint',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_boolean':
      'Boolean',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_color':
      'Color',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_content_relationship':
      'Link',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_date':
      'Date',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_embed':
      'Embed',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_image':
      'Image',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_key_text':
      'Text',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_link':
      'Link',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_link_to_media':
      'Link',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_number':
      'Number',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_title':
      'GeoPoint',
    'kitchen_sink.data.boolean': 'Boolean',
    'kitchen_sink.data.color': 'Color',
    'kitchen_sink.data.content_relationship': 'Link',
    'kitchen_sink.data.date': 'Date',
    'kitchen_sink.data.embed': 'Embed',
    'kitchen_sink.data.geopoint': 'GeoPoint',
    'kitchen_sink.data.group': 'Group',
    'kitchen_sink.data.group.group_boolean': 'Boolean',
    'kitchen_sink.data.group.group_color': 'Color',
    'kitchen_sink.data.group.group_content_relationship': 'Link',
    'kitchen_sink.data.group.group_date': 'Date',
    'kitchen_sink.data.group.group_embed': 'Embed',
    'kitchen_sink.data.group.group_geopoint': 'GeoPoint',
    'kitchen_sink.data.group.group_image': 'Image',
    'kitchen_sink.data.group.group_key_text': 'Text',
    'kitchen_sink.data.group.group_link': 'Link',
    'kitchen_sink.data.group.group_link_to_media': 'Link',
    'kitchen_sink.data.group.group_number': 'Number',
    'kitchen_sink.data.group.group_rich_text': 'GeoPoint',
    'kitchen_sink.data.group.group_select': 'Select',
    'kitchen_sink.data.group.group_timestamp': 'Timestamp',
    'kitchen_sink.data.group.group_title': 'GeoPoint',
    'kitchen_sink.data.image': 'Image',
    'kitchen_sink.data.key_text': 'Text',
    'kitchen_sink.data.link': 'Link',
    'kitchen_sink.data.link_to_media': 'Link',
    'kitchen_sink.data.number': 'Number',
    'kitchen_sink.data.rich_text': 'GeoPoint',
    'kitchen_sink.data.second_tab_body': 'Slices',
    'kitchen_sink.data.second_tab_body.second_tab_first_option': 'Slice',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_boolean':
      'Boolean',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_color':
      'Color',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_content_relationship':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_date':
      'Date',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_embed':
      'Embed',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_image':
      'Image',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_key_text':
      'Text',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_link':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_link_to_media':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_number':
      'Number',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_title':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_boolean':
      'Boolean',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_color':
      'Color',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_content_relationship':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_date':
      'Date',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_embed':
      'Embed',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_image':
      'Image',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_key_text':
      'Text',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_link':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_link_to_media':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_number':
      'Number',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_title':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option': 'Slice',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_boolean':
      'Boolean',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_color':
      'Color',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_content_relationship':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_date':
      'Date',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_embed':
      'Embed',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_image':
      'Image',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_key_text':
      'Text',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_link':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_link_to_media':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_number':
      'Number',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_title':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_boolean':
      'Boolean',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_color':
      'Color',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_content_relationship':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_date':
      'Date',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_embed':
      'Embed',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_geopoint':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_image':
      'Image',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_key_text':
      'Text',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_link':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_link_to_media':
      'Link',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_number':
      'Number',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_rich_text':
      'GeoPoint',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_title':
      'GeoPoint',
    'kitchen_sink.data.second_tab_boolean': 'Boolean',
    'kitchen_sink.data.second_tab_color': 'Color',
    'kitchen_sink.data.second_tab_content_relationship': 'Link',
    'kitchen_sink.data.second_tab_date': 'Date',
    'kitchen_sink.data.second_tab_embed': 'Embed',
    'kitchen_sink.data.second_tab_geopoint': 'GeoPoint',
    'kitchen_sink.data.second_tab_group': 'Group',
    'kitchen_sink.data.second_tab_group.second_tab_group_boolean': 'Boolean',
    'kitchen_sink.data.second_tab_group.second_tab_group_color': 'Color',
    'kitchen_sink.data.second_tab_group.second_tab_group_content_relationship':
      'Link',
    'kitchen_sink.data.second_tab_group.second_tab_group_date': 'Date',
    'kitchen_sink.data.second_tab_group.second_tab_group_embed': 'Embed',
    'kitchen_sink.data.second_tab_group.second_tab_group_geopoint': 'GeoPoint',
    'kitchen_sink.data.second_tab_group.second_tab_group_image': 'Image',
    'kitchen_sink.data.second_tab_group.second_tab_group_key_text': 'Text',
    'kitchen_sink.data.second_tab_group.second_tab_group_link': 'Link',
    'kitchen_sink.data.second_tab_group.second_tab_group_link_to_media': 'Link',
    'kitchen_sink.data.second_tab_group.second_tab_group_number': 'Number',
    'kitchen_sink.data.second_tab_group.second_tab_group_rich_text': 'GeoPoint',
    'kitchen_sink.data.second_tab_group.second_tab_group_select': 'Select',
    'kitchen_sink.data.second_tab_group.second_tab_group_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_group.second_tab_group_title': 'GeoPoint',
    'kitchen_sink.data.second_tab_image': 'Image',
    'kitchen_sink.data.second_tab_key_text': 'Text',
    'kitchen_sink.data.second_tab_link': 'Link',
    'kitchen_sink.data.second_tab_link_to_media': 'Link',
    'kitchen_sink.data.second_tab_number': 'Number',
    'kitchen_sink.data.second_tab_rich_text': 'GeoPoint',
    'kitchen_sink.data.second_tab_select': 'Select',
    'kitchen_sink.data.second_tab_timestamp': 'Timestamp',
    'kitchen_sink.data.second_tab_title': 'GeoPoint',
    'kitchen_sink.data.select': 'Select',
    'kitchen_sink.data.timestamp': 'Timestamp',
    'kitchen_sink.data.title': 'GeoPoint',
  })
})

describe('shared types', () => {
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

  test('creates structured text type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicPrefixStructuredTextType',
          fields: {
            text: expect.objectContaining({
              type: 'String',
              resolve: expect.any(Function),
            }),
            html: expect.objectContaining({
              type: 'String',
              resolve: expect.any(Function),
            }),
            raw: expect.objectContaining({
              type: 'JSON',
              resolve: expect.any(Function),
            }),
          },
        },
      }),
    )
  })

  test('creates embed type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicPrefixEmbedType',
          interfaces: ['Node'],
          extensions: { infer: true },
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
        kitchen_sink: {
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
        name: 'PrismicPrefixKitchenSink',
        fields: {
          uid: 'String!',
          prismicId: 'ID!',
          data: 'PrismicPrefixKitchenSinkDataType',
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

    const call = findCreateTypesCall('PrismicPrefixKitchenSink')
    const doc = { id: 'id', data: { foo: 'bar' } }
    const node = nodeHelpers.createNodeFactory('type')(doc)
    const resolver = call.config.fields.dataRaw.resolve
    const res = await resolver(node)

    expect(res).toEqual(doc.data)
  })

  test('url field resolves using linkResolver', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixKitchenSink')
    const node = nodeHelpers.createNodeFactory('type')({ id: 'id' })
    const resolver = call.config.fields.url.resolve

    expect(resolver(node)).toBe('linkResolver')
  })

  test('_previewable field resolves to Prismic ID', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixKitchenSink')
    const resolver = call.config.fields._previewable.resolve
    const node = nodeHelpers.createNodeFactory('type')({ id: 'id' })

    expect(resolver(node)).toBe(node.prismicId)
  })

  test('data field type includes all data fields', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        kitchen_sink: {
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
        name: 'PrismicPrefixKitchenSinkDataType',
        fields: {
          boolean: 'Boolean',
          color: 'String',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: { type: 'PrismicPrefixEmbedType', extensions: { link: {} } },
          geo_point: 'PrismicGeoPointType',
          group: '[PrismicPrefixKitchenSinkDataGroup]',
          image: 'PrismicPrefixKitchenSinkDataImageImageType',
          link: 'PrismicPrefixLinkType',
          number: 'Float',
          select: 'String',
          slices: '[PrismicPrefixKitchenSinkDataSlicesSlicesType]',
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
        kitchen_sink: {
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
        kitchen_sink: {
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
        kitchen_sink: {
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
        kitchen_sink: {
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
  test('text field resolves to text', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        kitchen_sink: {
          Main: {
            foo: { type: 'StructuredText' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixStructuredTextType')
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.text.resolve
    const res = await resolver(field)

    expect(res).toBe('Rich Text')
  })

  test('html field resolves to html text', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      htmlSerializer: undefined,
    })

    const call = findCreateTypesCall('PrismicPrefixStructuredTextType')
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.html.resolve
    const res = await resolver(field)

    expect(res).toBe('<p>Rich Text</p>')
  })

  test('html field uses htmlSerializer if provided', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixStructuredTextType')
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.html.resolve
    const res = await resolver(field)

    expect(res).toBe('htmlSerializer')
  })

  test('raw field resolves to raw value', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall('PrismicPrefixStructuredTextType')
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.raw.resolve
    const res = await resolver(field)

    expect(res).toEqual(field)
  })
})

describe('image fields', () => {
  test('creates field-specific image type', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        kitchen_sink: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataFooImageType',
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
        kitchen_sink: {
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
        name: 'PrismicPrefixKitchenSinkDataFooImageType',
        fields: expect.objectContaining({
          thumbnails: 'PrismicPrefixKitchenSinkDataFooImageThumbnailsType',
        }),
      }),
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataFooImageThumbnailsType',
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
        kitchen_sink: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixKitchenSinkDataFooImageType')
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
        kitchen_sink: {
          Main: {
            foo: { type: 'Image' },
          },
        },
      },
    })

    const call = findCreateTypesCall('PrismicPrefixKitchenSinkDataFooImageType')
    const field = { url: null }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBe(null)
  })
})

describe('slices', () => {
  test('creates types for each slice choice', async () => {
    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, {
      ...pluginOptions,
      schemas: {
        kitchen_sink: {
          Main: {
            slices: {
              type: 'Slices',
              config: {
                choices: {
                  foo: {
                    type: 'Slice',
                    repeat: {
                      repeat_text: { type: 'Text' },
                    },
                    'non-repeat': {
                      non_repeat_text: { type: 'Text' },
                    },
                  },
                  bar: {
                    type: 'Slice',
                    repeat: {
                      repeat_text: { type: 'Text' },
                    },
                    'non-repeat': {
                      non_repeat_text: { type: 'Text' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'UNION',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesSlicesType',
        types: [
          'PrismicPrefixKitchenSinkDataSlicesBar',
          'PrismicPrefixKitchenSinkDataSlicesFoo',
        ],
        resolveType: expect.any(Function),
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesFoo',
        fields: {
          items: '[PrismicPrefixKitchenSinkDataSlicesFooItem]',
          primary: 'PrismicPrefixKitchenSinkDataSlicesFooPrimary',
          slice_type: 'String!',
          slice_label: 'String',
        },
        extensions: { infer: false },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesFooPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesFooItem',
        fields: {
          repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesBar',
        fields: {
          items: '[PrismicPrefixKitchenSinkDataSlicesBarItem]',
          primary: 'PrismicPrefixKitchenSinkDataSlicesBarPrimary',
          slice_type: 'String!',
          slice_label: 'String',
        },
        extensions: { infer: false },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesBarPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixKitchenSinkDataSlicesBarItem',
        fields: {
          repeat_text: 'String',
        },
      },
    })
  })
})

describe('integration fields', () => {
  test('uses inferred type with link extension', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          integration: { type: PrismicFieldType.IntegrationField, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataType',
        fields: {
          integration: {
            type: 'PrismicPrefixFooDataIntegrationIntegrationType',
            extensions: { link: {} },
          },
        },
      },
    })
  })

  test('creates inferred type using path', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          integration: { type: PrismicFieldType.IntegrationField, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataIntegrationIntegrationType',
        interfaces: ['Node'],
        extensions: { infer: true },
      },
    })
  })
})

describe('unknown fields', () => {
  test('uses JSON type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          unknown: {
            // @ts-expect-error - We purposely want to use a type outside the enum of know types.
            type: 'unknown',
            config: {},
          },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataType',
        fields: {
          unknown: {
            type: 'JSON',
            resolve: expect.any(Function),
          },
        },
      },
    })
  })

  test('prints message about unknown type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          unknown: {
            // @ts-expect-error - We purposely want to use a type outside the enum of know types.
            type: 'unknown',
            config: {},
          },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.reporter?.info).toBeCalledWith(
      expect.stringMatching(/unknown field type "unknown"/),
    )
  })
})
