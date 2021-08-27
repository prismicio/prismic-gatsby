import test from 'ava'
import * as sinon from 'sinon'
import * as prismicM from '@prismicio/mock'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createMockKitchenSinkCustomTypeModel } from './__testutils__/createMockKitchenSinkCustomTypeModel'
import { createMockKitchenSinkSharedSliceModel } from './__testutils__/createMockKitchenSinkSharedSliceModel'
import { createNodeHelpers } from './__testutils__/createNodeHelpers'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

import { createSchemaCustomization } from '../src/gatsby-node'

test('includes base fields', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  customTypeModel.id = 'foo'
  customTypeModel.json = {}

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: {
        name: 'PrismicPrefixFoo',
        fields: {
          prismicId: 'ID!',
          alternate_languages: '[PrismicPrefixAlternateLanguageType!]!',
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
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({
    seed: t.title,
    withUID: true,
  })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

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
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFoo',
        fields: sinon.match({
          data: 'PrismicPrefixFooDataType!',
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
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFoo',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
  })
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')(document)
  const resolver = call.config.fields.dataRaw.resolve
  const res = await resolver(node)

  t.true(res === document.data)
})

test('url field resolves using linkResolver', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]
  pluginOptions.linkResolver = () => 'linkResolver'

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFoo',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
    withURL: false,
  })
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')(document)
  const resolver = call.config.fields.url.resolve

  t.true(resolver(node) === 'linkResolver')
})

test('_previewable field resolves to Prismic ID', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  customTypeModel.id = 'foo'

  pluginOptions.customTypeModels = [customTypeModel]

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFoo',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const resolver = call.config.fields._previewable.resolve
  const document = prismicM.value.document({
    seed: t.title,
    model: customTypeModel,
  })
  const nodeHelpers = createNodeHelpers(gatsbyContext, pluginOptions)
  const node = nodeHelpers.createNodeFactory('foo')(document)

  t.true(resolver(node) === node.prismicId)
})

test('data field type includes all data fields', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  const customTypeModel = createMockKitchenSinkCustomTypeModel(t)
  customTypeModel.id = 'foo'

  const sharedSliceModel = createMockKitchenSinkSharedSliceModel(t)
  sharedSliceModel.id = 'sharedSlice'

  pluginOptions.customTypeModels = [customTypeModel]
  pluginOptions.sharedSliceModels = [sharedSliceModel]

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
          contentRelationship: 'PrismicPrefixLinkType',
          date: { type: 'Date', extensions: { dateformat: {} } },
          embed: { type: 'PrismicPrefixEmbedType', extensions: { link: {} } },
          geoPoint: 'PrismicGeoPointType',
          image: 'PrismicPrefixFooDataImageImageType',
          integrationFields: {
            type: 'PrismicPrefixFooDataIntegrationFieldsIntegrationType',
            extensions: { link: {} },
          },
          keyText: 'String',
          link: 'PrismicPrefixLinkType',
          linkToMedia: 'PrismicPrefixLinkType',
          number: 'Float',
          richText: 'PrismicPrefixStructuredTextType',
          select: 'String',
          timestamp: { type: 'Date', extensions: { dateformat: {} } },
          title: 'PrismicPrefixStructuredTextType',
          group: '[PrismicPrefixFooDataGroup]',
          sliceZone: '[PrismicPrefixFooDataSliceZoneSlicesType!]!',
        },
      },
    }),
  )
})
