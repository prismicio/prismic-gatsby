import { PrismicFieldType, PrismicSchema } from '../src'
import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import kitchenSinkSchema from './__fixtures__/kitchenSinkSchema.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findCreateTypesCall = (name: string, createTypes: jest.Mock): any =>
  createTypes.mock.calls.find((call) => call[0].config.name === name)[0]

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates type path nodes', async () => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    kitchen_sink: kitchenSinkSchema as PrismicSchema,
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const calls = (gatsbyContext.actions.createNode as jest.Mock).mock.calls
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
      'StructuredText',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_select':
      'Select',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.first_option.items.first_option_repeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.first_option.primary.first_option_nonrepeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_select':
      'Select',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.second_option.items.second_option_repeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.body.second_option.primary.second_option_nonrepeat_title':
      'StructuredText',
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
    'kitchen_sink.data.group.group_rich_text': 'StructuredText',
    'kitchen_sink.data.group.group_select': 'Select',
    'kitchen_sink.data.group.group_timestamp': 'Timestamp',
    'kitchen_sink.data.group.group_title': 'StructuredText',
    'kitchen_sink.data.image': 'Image',
    'kitchen_sink.data.key_text': 'Text',
    'kitchen_sink.data.link': 'Link',
    'kitchen_sink.data.link_to_media': 'Link',
    'kitchen_sink.data.number': 'Number',
    'kitchen_sink.data.rich_text': 'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.items.second_tab_first_option_repeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_first_option.primary.second_tab_first_option_nonrepeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.items.second_tab_second_option_repeat_title':
      'StructuredText',
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
      'StructuredText',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_select':
      'Select',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_body.second_tab_second_option.primary.second_tab_second_option_nonrepeat_title':
      'StructuredText',
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
    'kitchen_sink.data.second_tab_group.second_tab_group_rich_text':
      'StructuredText',
    'kitchen_sink.data.second_tab_group.second_tab_group_select': 'Select',
    'kitchen_sink.data.second_tab_group.second_tab_group_timestamp':
      'Timestamp',
    'kitchen_sink.data.second_tab_group.second_tab_group_title':
      'StructuredText',
    'kitchen_sink.data.second_tab_image': 'Image',
    'kitchen_sink.data.second_tab_key_text': 'Text',
    'kitchen_sink.data.second_tab_link': 'Link',
    'kitchen_sink.data.second_tab_link_to_media': 'Link',
    'kitchen_sink.data.second_tab_number': 'Number',
    'kitchen_sink.data.second_tab_rich_text': 'StructuredText',
    'kitchen_sink.data.second_tab_select': 'Select',
    'kitchen_sink.data.second_tab_timestamp': 'Timestamp',
    'kitchen_sink.data.second_tab_title': 'StructuredText',
    'kitchen_sink.data.select': 'Select',
    'kitchen_sink.data.timestamp': 'Timestamp',
    'kitchen_sink.data.title': 'StructuredText',
  })
})

describe('document', () => {
  test('includes base fields', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {},
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFoo',
        fields: {
          prismicId: 'ID!',
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
          url: {
            type: 'String',
            resolve: expect.any(Function),
          },
          _previewable: {
            type: 'ID!',
            resolve: expect.any(Function),
          },
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      },
    })
  })

  test('includes UID field if included in the schema', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          uid: { type: PrismicFieldType.UID, config: {} },
          foo: { type: PrismicFieldType.Text, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: expect.objectContaining({
        name: 'PrismicPrefixFoo',
        fields: expect.objectContaining({
          uid: 'String!',
        }),
      }),
    })
  })

  test('includes data fields if the schema contains fields', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          foo: { type: PrismicFieldType.Text, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: expect.objectContaining({
        name: 'PrismicPrefixFoo',
        fields: expect.objectContaining({
          data: 'PrismicPrefixFooDataType',
          dataRaw: {
            type: 'JSON!',
            resolve: expect.any(Function),
          },
        }),
      }),
    })
  })

  test('dataRaw field resolves to raw data object', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          foo: { type: PrismicFieldType.Text, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFoo',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const doc = { id: 'id', data: { foo: 'bar' } }
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
    const node = nodeHelpers.createNodeFactory('foo')(doc)
    const resolver = call.config.fields.dataRaw.resolve
    const res = await resolver(node)

    expect(res).toEqual(doc.data)
  })

  test('url field resolves using linkResolver', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {},
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFoo',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
    const node = nodeHelpers.createNodeFactory('foo')({ id: 'id' })
    const resolver = call.config.fields.url.resolve

    expect(resolver(node)).toBe('linkResolver')
  })

  test('_previewable field resolves to Prismic ID', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {},
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFoo',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const resolver = call.config.fields._previewable.resolve
    const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
    const node = nodeHelpers.createNodeFactory('foo')({ id: 'id' })

    expect(resolver(node)).toBe(node.prismicId)
  })

  test('data field type includes all data fields', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          uid: { type: PrismicFieldType.UID, config: {} },
          boolean: { type: PrismicFieldType.Boolean, config: {} },
          color: { type: PrismicFieldType.Color, config: {} },
          date: { type: PrismicFieldType.Date, config: {} },
          embed: { type: PrismicFieldType.Embed, config: {} },
          geo_point: { type: PrismicFieldType.GeoPoint, config: {} },
          image: { type: PrismicFieldType.Image, config: {} },
          link: { type: PrismicFieldType.Link, config: {} },
          number: { type: PrismicFieldType.Number, config: {} },
          select: { type: PrismicFieldType.Select, config: {} },
          structured_text: {
            type: PrismicFieldType.StructuredText,
            config: {},
          },
          text: { type: PrismicFieldType.Text, config: {} },
          timestamp: { type: PrismicFieldType.Timestamp, config: {} },
          group: {
            type: PrismicFieldType.Group,
            config: {
              fields: {
                foo: { type: PrismicFieldType.Text, config: {} },
              },
            },
          },
          slices: {
            type: PrismicFieldType.Slices,
            config: {
              choices: {
                foo: {
                  type: PrismicFieldType.Slice,
                  repeat: {},
                  'non-repeat': {},
                },
              },
            },
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
          boolean: 'Boolean',
          color: 'String',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: { type: 'PrismicPrefixEmbedType', extensions: { link: {} } },
          geo_point: 'PrismicGeoPointType',
          group: '[PrismicPrefixFooDataGroup]',
          image: 'PrismicPrefixFooDataImageImageType',
          link: 'PrismicPrefixLinkType',
          number: 'Float',
          select: 'String',
          slices: '[PrismicPrefixFooDataSlicesSlicesType]',
          structured_text: 'PrismicPrefixStructuredTextType',
          text: 'String',
          timestamp: { type: 'Date', extensions: { dateformat: {} } },
        },
      },
    })
  })
})

describe('geopoint fields', () => {
  test('creates base type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

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
})

describe('embed fields', () => {
  test('creates base type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

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
})

describe('link fields', () => {
  test('creates base types', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

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

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
        kind: 'OBJECT',
        config: {
          name: 'PrismicPrefixLinkType',
          fields: {
            link_type: 'PrismicLinkTypeEnum',
            isBroken: 'Boolean',
            url: {
              type: 'String',
              resolve: expect.any(Function),
            },
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
            raw: {
              type: 'JSON',
              resolve: expect.any(Function),
            },
          },
        },
      }),
    )
  })

  test('document field resolves to linked node ID if link type is Document and document is present', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = {
      link_type: 'Document',
      type: 'foo',
      id: 'id',
      isBroken: false,
    }
    const resolver = call.config.fields.document.resolve
    const res = await resolver(field)

    expect(res).toBe(`Prismic prefix ${field.id}`)
  })

  test('document field resolves to null if link type is Document and isBroken is true', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = {
      link_type: 'Document',
      type: 'foo',
      id: 'id',
      isBroken: true,
    }
    const resolver = call.config.fields.document.resolve
    const res = await resolver(field)

    expect(res).toBeNull()
  })

  test('document field resolves to null if link type is not Document', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { link_type: 'Media', url: 'url' }
    const resolver = call.config.fields.document.resolve
    const res = await resolver(field)

    expect(res).toBeNull()
  })

  test('localFile field resolves to remote node if link type is Media and url is present', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { url: 'url', link_type: 'Media' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res.id).toBe('remoteFileNodeId')
  })

  test('localFile field resolves to null if link type is Media and url is not present', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { url: null, link_type: 'Media' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBeNull()
  })

  test('localFile field resolves to null if link type is not Media', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixLinkType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { url: 'url', link_type: 'Document' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBeNull()
  })
})

describe('structured text fields', () => {
  test('creates base type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

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

  test('text field resolves to text', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixStructuredTextType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.text.resolve
    const res = await resolver(field)

    expect(res).toBe('Rich Text')
  })

  test('html field resolves to html', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    delete pluginOptions.htmlSerializer

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixStructuredTextType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.html.resolve
    const res = await resolver(field)

    expect(res).toBe('<p>Rich Text</p>')
  })

  test('html field uses htmlSerializer if provided', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixStructuredTextType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.html.resolve
    const res = await resolver(field)

    expect(res).toBe('htmlSerializer')
  })

  test('raw field resolves to raw value', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixStructuredTextType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = [{ type: 'paragraph', text: 'Rich Text', spans: [] }]
    const resolver = call.config.fields.raw.resolve
    const res = await resolver(field)

    expect(res).toEqual(field)
  })
})

describe('image fields', () => {
  test('creates base types', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

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

    expect(gatsbyContext.actions.createTypes).toBeCalledWith(
      expect.objectContaining({
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
      }),
    )
  })

  test('creates field-specific image type', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          image: { type: PrismicFieldType.Image, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataImageImageType',
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
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          image: {
            type: PrismicFieldType.Image,
            config: {
              thumbnails: [{ name: 'Mobile', width: 1000 }],
            },
          },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: expect.objectContaining({
        name: 'PrismicPrefixFooDataImageImageType',
        fields: expect.objectContaining({
          thumbnails: 'PrismicPrefixFooDataImageImageThumbnailsType',
        }),
      }),
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataImageImageThumbnailsType',
        fields: {
          Mobile: 'PrismicPrefixImageThumbnailType',
        },
      },
    })
  })

  test('localFile field resolves to remote node if image is present', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          image: { type: PrismicFieldType.Image, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFooDataImageImageType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { url: 'url' }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res.id).toBe('remoteFileNodeId')
  })

  test('localFile field resolves to null if image is not present', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          image: { type: PrismicFieldType.Image, config: {} },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFooDataImageImageType',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = { url: null }
    const resolver = call.config.fields.localFile.resolve
    const res = await resolver(field)

    expect(res).toBe(null)
  })
})

describe('slices', () => {
  test('creates types for each slice choice', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          slices: {
            type: PrismicFieldType.Slices,
            config: {
              choices: {
                foo: {
                  type: PrismicFieldType.Slice,
                  repeat: {
                    repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                },
                bar: {
                  type: PrismicFieldType.Slice,
                  repeat: {
                    repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'UNION',
      config: {
        name: 'PrismicPrefixFooDataSlicesSlicesType',
        types: [
          'PrismicPrefixFooDataSlicesBar',
          'PrismicPrefixFooDataSlicesFoo',
        ],
        resolveType: expect.any(Function),
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesFoo',
        fields: {
          items: '[PrismicPrefixFooDataSlicesFooItem]',
          primary: 'PrismicPrefixFooDataSlicesFooPrimary',
          slice_type: 'String!',
          slice_label: 'String',
          id: expect.objectContaining({
            type: 'ID!',
            resolve: expect.any(Function),
          }),
        },
        interfaces: ['PrismicSliceType'],
        extensions: { infer: false },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesFooPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesFooItem',
        fields: {
          repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesBar',
        fields: {
          items: '[PrismicPrefixFooDataSlicesBarItem]',
          primary: 'PrismicPrefixFooDataSlicesBarPrimary',
          slice_type: 'String!',
          slice_label: 'String',
          id: expect.objectContaining({
            type: 'ID!',
            resolve: expect.any(Function),
          }),
        },
        interfaces: ['PrismicSliceType'],
        extensions: { infer: false },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesBarPrimary',
        fields: {
          non_repeat_text: 'String',
        },
      },
    })

    expect(gatsbyContext.actions.createTypes).toBeCalledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFooDataSlicesBarItem',
        fields: {
          repeat_text: 'String',
        },
      },
    })
  })

  test('id field resolves to a unique id', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          slices: {
            type: PrismicFieldType.Slices,
            config: {
              choices: {
                foo: {
                  type: PrismicFieldType.Slice,
                  repeat: {
                    repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                  'non-repeat': {
                    non_repeat_text: {
                      type: PrismicFieldType.Text,
                      config: {},
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    // @ts-expect-error - Partial gatsbyContext provided
    await createSchemaCustomization(gatsbyContext, pluginOptions)

    const call = findCreateTypesCall(
      'PrismicPrefixFooDataSlicesFoo',
      gatsbyContext.actions.createTypes as jest.Mock,
    )
    const field = {
      primary: {
        non_repeat_text: [{ type: 'paragraph', text: 'Rich Text', spans: [] }],
      },
      items: [],
    }
    const resolver = call.config.fields.id.resolve
    const res = await resolver(field)

    expect(res).toBe('Prismic prefix foo data slices foo createContentDigest')
  })
})

describe('integration fields', () => {
  test('uses inferred type with link extension', async () => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions()

    pluginOptions.schemas = {
      foo: {
        Main: {
          integration: { type: PrismicFieldType.IntegrationFields, config: {} },
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
          integration: { type: PrismicFieldType.IntegrationFields, config: {} },
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
