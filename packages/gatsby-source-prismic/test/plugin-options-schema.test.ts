import test from 'ava'
import * as msw from 'msw'
import * as mswn from 'msw/node'
import * as prismicM from '@prismicio/mock'
import {
  testPluginOptionsSchema,
  Joi,
  validateOptionsSchema,
} from 'gatsby-plugin-utils'
import fetch from 'node-fetch'

import { createAPIRepositoryMockedRequest } from './__testutils__/createAPIRepositoryMockedRequest'
import { createCustomTypesAPIMockedRequest } from './__testutils__/createCustomTypesAPIMockedRequest'
import { createCustomTypesAPISharedSlicesMockedRequest } from './__testutils__/createCustomTypesAPISharedSlicesMockedRequest'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { resolveURL } from './__testutils__/resolveURL'

import { PluginOptions } from '../src'
import { pluginOptionsSchema } from '../src/plugin-options-schema'

const server = mswn.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.afterEach(() => server.resetHandlers())
test.after(() => server.close())

test.serial('passes on valid options', async (t) => {
  const customTypeModel = prismicM.model.customType({ seed: t.title })
  const sharedSliceModel = prismicM.model.sharedSlice({ seed: t.title })

  const pluginOptions: PluginOptions = {
    repositoryName: 'string',
    accessToken: 'string',
    customTypesApiToken: 'string',
    customTypesApiEndpoint: 'https://example-custom-types-api-endpoint.com',
    apiEndpoint: 'https://example-apiEndpoint.com',
    releaseID: 'string',
    graphQuery: 'string',
    lang: 'string',
    linkResolver: (): string => '',
    htmlSerializer: {},
    customTypeModels: [customTypeModel],
    sharedSliceModels: [sharedSliceModel],
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { q: 100 },
    typePrefix: 'string',
    webhookSecret: 'string',
    // @ts-expect-error - noop purposely given for test
    createRemoteFileNode: (): void => void 0,
    transformFieldName: (x: string): string => x,
    fetch,
  }

  const repositoryResponse = prismicM.api.repository({
    seed: t.title,
    customTypeModels: [customTypeModel],
  })

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )

  server.use(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    msw.rest.get(pluginOptions.customTypesApiEndpoint!, (_req, res, ctx) => {
      return res(ctx.json([]))
    }),
  )

  server.use(
    msw.rest.get(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolveURL(pluginOptions.customTypesApiEndpoint!, '/slices'),
      (_req, res, ctx) => {
        return res(ctx.json([]))
      },
    ),
  )

  server.use(createCustomTypesAPIMockedRequest(pluginOptions, []))

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.deepEqual(res.errors, [])
  t.true(res.isValid)
})

test.serial('fails on missing options', async (t) => {
  const pluginOptions = {}
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, ['"repositoryName" is required'])
})

test.serial('fails on invalid options', async (t) => {
  const pluginOptions = {
    repositoryName: Symbol(),
    accessToken: Symbol(),
    customTypesApiToken: Symbol(),
    customTypesApiEndpoint: Symbol(),
    apiEndpoint: Symbol(),
    releaseID: Symbol(),
    graphQuery: Symbol(),
    lang: Symbol(),
    linkResolver: Symbol(),
    htmlSerializer: Symbol(),
    schemas: Symbol(),
    customTypeModels: Symbol(),
    sharedSliceModels: Symbol(),
    imageImgixParams: Symbol(),
    imagePlaceholderImgixParams: Symbol(),
    typePrefix: Symbol(),
    webhookSecret: Symbol(),
    createRemoteFileNode: Symbol(),
    fetch: Symbol(),
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"repositoryName" must be a string',
    '"accessToken" must be a string',
    '"apiEndpoint" must be a string',
    '"customTypesApiToken" must be a string',
    '"customTypesApiEndpoint" must be a string',
    '"releaseID" must be a string',
    '"graphQuery" must be a string',
    '"lang" must be a string',
    '"linkResolver" must be of type function',
    '"htmlSerializer" must be one of [object]',
    '"schemas" must be of type object',
    '"customTypeModels" must be an array',
    '"sharedSliceModels" must be an array',
    '"imageImgixParams" must be of type object',
    '"imagePlaceholderImgixParams" must be of type object',
    '"typePrefix" must be a string',
    '"webhookSecret" must be a string',
    '"createRemoteFileNode" must be of type function',
    '"fetch" must be of type function',
  ])
})

test.serial('fails on invalid customTypesApiToken', async (t) => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    customTypesApiToken: 'customTypesApiToken',
  }

  // Intentionally making a failed 403 response.
  server.use(
    msw.rest.get(
      'https://customtypes.prismic.io/customtypes',
      (_req, res, ctx) =>
        res(ctx.status(403), ctx.json({ message: '[MOCK FORBIDDEN ERROR]' })),
    ),
  )

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, ['[MOCK FORBIDDEN ERROR]'])
})

test.serial('allows only one of qraphQuery or fetchLinks', async (t) => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    customTypeModels: [prismicM.model.customType({ seed: t.title })],
    graphQuery: 'string',
    fetchLinks: ['string'],
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
  ])
})

test.serial('checks that all schemas are provided', async (t) => {
  const pluginOptions = createPluginOptions(t)
  pluginOptions.customTypeModels = []
  pluginOptions.customTypesApiToken = undefined

  const { plugins, ...pluginOptionsWithoutPlugins } = pluginOptions

  // This line is to ignore tsserver's unused variable wraning.
  plugins

  const customTypeModel = prismicM.model.customType({ seed: t.title })
  const repositoryResponse = prismicM.api.repository({
    seed: t.title,
    customTypeModels: [customTypeModel],
  })

  server.use(
    createAPIRepositoryMockedRequest({
      pluginOptions,
      repositoryResponse,
    }),
  )

  const res = await testPluginOptionsSchema(
    pluginOptionsSchema,
    pluginOptionsWithoutPlugins,
  )

  t.false(res.isValid)
  t.true(res.errors.length === 1)
  t.true(new RegExp(customTypeModel.id).test(res.errors[0]))
})

test.serial(
  'populates customTypeModels if customTypesApiToken is provided',
  async (t) => {
    const pluginOptions = createPluginOptions(t)
    const { plugins, ...pluginOptionsWithoutPlugins } = pluginOptions

    // This line is to ignore tsserver's unused variable wraning.
    plugins

    const customType1 = prismicM.model.customType({ seed: t.title })
    const customType2 = prismicM.model.customType({ seed: t.title })
    const customTypeModels = [customType1, customType2]

    const sharedSlice1 = prismicM.model.sharedSlice({ seed: t.title })
    const sharedSlice2 = prismicM.model.sharedSlice({ seed: t.title })
    const sharedSliceModels = [sharedSlice1, sharedSlice2]

    const repositoryResponse = prismicM.api.repository({
      seed: t.title,
      customTypeModels,
    })

    server.use(
      createAPIRepositoryMockedRequest({
        pluginOptions,
        repositoryResponse,
      }),
      createCustomTypesAPIMockedRequest(pluginOptions, customTypeModels),
      createCustomTypesAPISharedSlicesMockedRequest(
        pluginOptions,
        sharedSliceModels,
      ),
    )

    const schema = pluginOptionsSchema({ Joi })
    const res = (await validateOptionsSchema(
      schema,
      pluginOptionsWithoutPlugins,
    )) as PluginOptions

    // We need to stringify since `customTypeModels` may contain `undefined`.
    // `undefined` is not valid JSON and is not sent through msw.
    t.deepEqual(
      res.customTypeModels,
      JSON.parse(JSON.stringify(customTypeModels)),
    )
  },
)

test.serial(
  'merges schemas if customTypesApiToken and schemas are provided',
  async (t) => {
    const pluginOptions = createPluginOptions(t)

    const customTypeNotInAPI = prismicM.model.customType({ seed: t.title })
    const customType1 = prismicM.model.customType({ seed: t.title })
    const customType2 = prismicM.model.customType({ seed: t.title })
    const customTypeModels = [customType1, customType2]

    const sharedSliceNotInAPI = prismicM.model.sharedSlice({ seed: t.title })
    const sharedSlice1 = prismicM.model.sharedSlice({ seed: t.title })
    const sharedSlice2 = prismicM.model.sharedSlice({ seed: t.title })
    const sharedSliceModels = [sharedSlice1, sharedSlice2]

    pluginOptions.customTypeModels = [
      customTypeNotInAPI,
      {
        ...customTypeNotInAPI,
        id: customType1.id,
      },
    ]

    pluginOptions.sharedSliceModels = [
      sharedSliceNotInAPI,
      {
        ...sharedSliceNotInAPI,
        id: sharedSlice1.id,
      },
    ]

    const repositoryResponse = prismicM.api.repository({
      seed: t.title,
      customTypeModels,
    })

    server.use(
      createAPIRepositoryMockedRequest({
        pluginOptions,
        repositoryResponse,
      }),
      createCustomTypesAPIMockedRequest(pluginOptions, customTypeModels),
      createCustomTypesAPISharedSlicesMockedRequest(
        pluginOptions,
        sharedSliceModels,
      ),
    )

    const { plugins, ...pluginOptionsWithoutPlugins } = pluginOptions

    // This line is to ignore tsserver's unused variable wraning.
    plugins

    const schema = pluginOptionsSchema({ Joi })
    const res = (await validateOptionsSchema(
      schema,
      pluginOptionsWithoutPlugins,
    )) as PluginOptions

    // TODO: Properly allow overriding types by checking IDs. Prefer models passed via options.
    // We need to stringify since `customTypeModels` may contain `undefined`.
    // `undefined` is not valid JSON and is not sent through msw.
    t.deepEqual(
      res.customTypeModels,
      JSON.parse(
        JSON.stringify([
          // These custom types were not provided in the plugin options, but is
          // provided by the API.
          customType1,
          customType2,

          // We are testing that a schema provided by the API can be overridden by
          // one provided in plugin options.
          customTypeNotInAPI,

          { ...customTypeNotInAPI, id: customType1.id },
        ]),
      ),
    )
  },
)
