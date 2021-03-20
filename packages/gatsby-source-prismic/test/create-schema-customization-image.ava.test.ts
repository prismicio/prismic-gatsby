import test from 'ava'
import * as sinon from 'sinon'

import { PrismicFieldType } from '../src'
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
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicImageDimensionsType',
        fields: { width: 'Int!', height: 'Int!' },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith(
      sinon.match({
        kind: 'OBJECT',
        config: sinon.match({
          name: 'PrismicPrefixImageThumbnailType',
          fields: {
            alt: 'String',
            copyright: 'String',
            dimensions: 'PrismicImageDimensionsType',
            url: sinon.match({
              type: sinon.match.any,
              resolve: sinon.match.func,
            }),
            fixed: sinon.match({
              type: sinon.match.any,
              resolve: sinon.match.func,
            }),
            fluid: sinon.match({
              type: sinon.match.any,
              resolve: sinon.match.func,
            }),
            localFile: sinon.match({
              type: 'File',
              resolve: sinon.match.func,
            }),
          },
        }),
      }),
    ),
  )
})

test('creates field-specific image type', async (t) => {
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataImageImageType',
        fields: {
          alt: 'String',
          copyright: 'String',
          dimensions: 'PrismicImageDimensionsType',
          url: sinon.match({
            type: sinon.match.any,
            resolve: sinon.match.func,
          }),
          fixed: sinon.match({
            type: sinon.match.any,
            resolve: sinon.match.func,
          }),
          fluid: sinon.match({
            type: sinon.match.any,
            resolve: sinon.match.func,
          }),
          localFile: sinon.match({
            type: 'File',
            resolve: sinon.match.func,
          }),
        },
      }),
    }),
  )
})

test('creates field-specific thumbnail types', async (t) => {
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

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataImageImageType',
        fields: {
          thumbnails: 'PrismicPrefixFooDataImageImageThumbnailsType',
        },
      }),
    }),
  )

  t.true(
    (gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
      kind: 'OBJECT',
      config: sinon.match({
        name: 'PrismicPrefixFooDataImageImageThumbnailsType',
        fields: {
          Mobile: 'PrismicPrefixImageThumbnailType',
        },
      }),
    }),
  )
})

test('localFile field resolves to remote node if image is present', async (t) => {
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
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: 'url' }
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res.id === 'remoteFileNodeId')
})

test('localFile field resolves to null if image is not present', async (t) => {
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
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: null }
  const resolver = call.config.fields.localFile.resolve
  const res = await resolver(field)

  t.true(res === null)
})
