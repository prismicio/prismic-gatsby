import test from 'ava'
import * as sinon from 'sinon'
import * as msw from 'msw'
import * as mswn from 'msw/node'
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
            gatsbyImageData: sinon.match({
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
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: { label: 'Image', constraint: {}, thumbnails: [] },
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
          gatsbyImageData: sinon.match({
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
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: {
            label: 'Image',
            constraint: {},
            thumbnails: [{ name: 'Mobile', width: 1000, height: null }],
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
          thumbnails: {
            type: 'PrismicPrefixFooDataImageImageThumbnailsType',
            resolve: sinon.match.func,
          },
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
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: { label: 'Image', constraint: {}, thumbnails: [] },
        },
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
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: { label: 'Image', constraint: {}, thumbnails: [] },
        },
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

test('thumbnail field resolves thumbnails', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: {
            label: 'Image',
            constraint: {},
            thumbnails: [{ name: 'Mobile', width: 1000, height: null }],
          },
        },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFooDataImageImageType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  const field = { url: 'url', mobile: { url: 'mobile-url' } }
  const resolver = call.config.fields.thumbnails.resolve
  const res = await resolver(field)

  t.true(res.mobile === field.mobile)
})

test('existing image URL parameters are persisted unless replaced in gatsby-plugin-image and gatsby-image fields', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  pluginOptions.schemas = {
    foo: {
      Main: {
        image: {
          type: prismicT.CustomTypeModelFieldType.Image,
          config: { label: 'Image', constraint: {}, thumbnails: [] },
        },
      },
    },
  }

  // @ts-expect-error - Partial gatsbyContext provided
  await createSchemaCustomization(gatsbyContext, pluginOptions)

  const call = findCreateTypesCall(
    'PrismicPrefixFooDataImageImageType',
    gatsbyContext.actions.createTypes as sinon.SinonStub,
  )
  // We'll override the `sat` parameter, but leave `rect` untouched.
  // We're adding the `w=1` parameter to ensure that it is replaced by the
  // resolver to properly support responsive images.
  const originalUrl = new URL(
    'https://example.com/image.png?rect=0,0,100,200&sat=100&w=1',
  )
  const field = { url: originalUrl.toString() }
  const imgixParams = { sat: 50 }

  const server = mswn.setupServer(
    msw.rest.get(
      `${originalUrl.origin}${originalUrl.pathname}`,
      (req, res, ctx) => {
        const params = req.url.searchParams

        if (params.get('fm') === 'json') {
          return res(
            ctx.json({
              'Content-Type': 'image/png',
              PixelWidth: 200,
              PixelHeight: 100,
            }),
          )
        } else {
          t.fail(
            'Forcing a failure due to an unhandled request for Imgix image metadata',
          )

          return
        }
      },
    ),
  )
  server.listen({ onUnhandledRequest: 'error' })
  t.teardown(() => {
    server.close()
  })

  const urlRes = await call.config.fields.url.resolve(field, { imgixParams })
  const urlUrl = new URL(urlRes)
  t.is(urlUrl.searchParams.get('sat'), imgixParams.sat.toString())
  t.is(urlUrl.searchParams.get('rect'), originalUrl.searchParams.get('rect'))
  t.is(urlUrl.searchParams.get('w'), originalUrl.searchParams.get('w'))

  const fixedRes = await call.config.fields.fixed.resolve(field, {
    imgixParams,
  })
  const fixedSrcUrl = new URL(fixedRes.src)
  t.is(fixedSrcUrl.searchParams.get('sat'), imgixParams.sat.toString())
  t.is(
    fixedSrcUrl.searchParams.get('rect'),
    originalUrl.searchParams.get('rect'),
  )
  t.not(fixedSrcUrl.searchParams.get('w'), originalUrl.searchParams.get('w'))

  const fluidRes = await call.config.fields.fluid.resolve(field, {
    imgixParams,
  })
  const fluidSrcUrl = new URL(fluidRes.src)
  t.is(fluidSrcUrl.searchParams.get('sat'), imgixParams.sat.toString())
  t.is(
    fluidSrcUrl.searchParams.get('rect'),
    originalUrl.searchParams.get('rect'),
  )
  t.not(fluidSrcUrl.searchParams.get('w'), originalUrl.searchParams.get('w'))

  const gatsbyImageDataRes = await call.config.fields.gatsbyImageData.resolve(
    field,
    { imgixParams },
  )
  const gatsbyImageDataSrcUrl = new URL(gatsbyImageDataRes.images.fallback.src)
  t.is(
    gatsbyImageDataSrcUrl.searchParams.get('sat'),
    imgixParams.sat.toString(),
  )
  t.is(
    gatsbyImageDataSrcUrl.searchParams.get('rect'),
    originalUrl.searchParams.get('rect'),
  )
  t.not(
    gatsbyImageDataSrcUrl.searchParams.get('w'),
    originalUrl.searchParams.get('w'),
  )
})
