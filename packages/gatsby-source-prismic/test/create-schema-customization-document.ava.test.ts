import test from 'ava'
import * as sinon from 'sinon'

import { PrismicFieldType } from '../src'
import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

test('includes base fields', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  pluginOptions.schemas = {
    foo: {
      Main: {},
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
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
            resolve: sinon.match.func,
          },
          _previewable: {
            type: 'ID!',
            resolve: sinon.match.func,
          },
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      },
    }),
  )
})

test('includes UID field if included in the schema', async (t) => {
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFoo',
        fields: sinon.match({
          uid: 'String!',
        }),
      }),
    }),
  )
})

test('includes data fields if the schema contains fields', async (t) => {
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFoo',
        fields: sinon.match({
          data: 'PrismicPrefixFooDataType',
          dataRaw: {
            type: 'JSON!',
            resolve: sinon.match.func,
          },
        }),
      }),
    }),
  )
})

test('dataRaw field resolves to raw data object', async (t) => {
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
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const doc = { id: 'id', data: { foo: 'bar' } }
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')(doc)
  const resolver = call.config.fields.dataRaw.resolve
  const res = await resolver(node)

  t.true(res === doc.data)
})

test('url field resolves using linkResolver', async (t) => {
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
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')({ id: 'id' })
  const resolver = call.config.fields.url.resolve

  t.true(resolver(node) === 'linkResolver')
})

test('_previewable field resolves to Prismic ID', async (t) => {
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
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const resolver = call.config.fields._previewable.resolve
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')({ id: 'id' })

  t.true(resolver(node) === node.prismicId)
})

test('data field type includes all data fields', async (t) => {
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
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
    }),
  )
})
