import test from 'ava'
import * as sinon from 'sinon'
import * as prismicM from '@prismicio/mock'
import * as prismicT from '@prismicio/types'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

import { createSchemaCustomization } from '../src/gatsby-node'

test('creates base types', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'ENUM',
      config: sinon.match({
        name: 'PrismicLinkTypeEnum',
        values: { Any: {}, Document: {}, Media: {}, Web: {} },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixLinkType',
        fields: {
          link_type: 'PrismicLinkTypeEnum',
          isBroken: 'Boolean',
          url: {
            type: 'String',
            resolve: sinon.match.func,
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
            resolve: sinon.match.func,
            extensions: { link: {} },
          },
          localFile: {
            type: 'File',
            resolve: sinon.match.func,
          },
          raw: {
            type: 'JSON',
            resolve: sinon.match.func,
          },
        },
      }),
    }),
  )
})

test('document field resolves to linked node ID if link type is Document and document is present', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Document,
  })
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === `Prismic prefix ${field.id}`)
})

test('document field resolves to null if link type is Document and isBroken is true', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Document,
  })
  field.isBroken = true
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('document field resolves to null if link type is not Document', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Media,
  })
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('localFile field resolves to remote node if link type is Media and url is present', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Media,
  })
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res.id === 'remoteFileNodeId')
})

test('localFile field resolves to null if link type is Media and url is not present', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Media,
    isFilled: false,
  })
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('localFile field resolves to null if link type is not Media', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = prismicM.value.link({
    seed: t.title,
    type: prismicT.LinkType.Document,
  })
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res === null)
})
