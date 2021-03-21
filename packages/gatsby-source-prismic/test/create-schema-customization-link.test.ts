import test from 'ava'
import * as sinon from 'sinon'

import { createSchemaCustomization } from '../src/gatsby-node'

import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { findCreateTypesCall } from './__testutils__/findCreateTypesCall'

test('creates base types', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

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
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = {
    link_type: 'Document',
    type: 'foo',
    id: 'id',
    isBroken: false,
  }
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === `Prismic prefix ${field.id}`)
})

test('document field resolves to null if link type is Document and isBroken is true', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = {
    link_type: 'Document',
    type: 'foo',
    id: 'id',
    isBroken: true,
  }
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('document field resolves to null if link type is not Document', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { link_type: 'Media', url: 'url' }
  const resolver = call.config.fields.document.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('localFile field resolves to remote node if link type is Media and url is present', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: 'url', link_type: 'Media' }
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res.id === 'remoteFileNodeId')
})

test('localFile field resolves to null if link type is Media and url is not present', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: null, link_type: 'Media' }
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res === null)
})

test('localFile field resolves to null if link type is not Media', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixLinkType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: 'url', link_type: 'Document' }
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res === null)
})
