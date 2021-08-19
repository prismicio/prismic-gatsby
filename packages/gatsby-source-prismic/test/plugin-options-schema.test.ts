import test from 'ava'
import * as msw from 'msw'
import * as mswn from 'msw/node'
import * as prismic from '@prismicio/client'
import {
  testPluginOptionsSchema,
  Joi,
  validateOptionsSchema,
} from 'gatsby-plugin-utils'
import fetch from 'node-fetch'

import kitchenSinkSchemaFixture from './__fixtures__/kitchenSinkSchema.json'
import kitchenSinkSharedSliceSchemaFixture from './__fixtures__/kitchenSinkSharedSliceSchema.json'
import { createCustomTypesAPICustomType } from './__testutils__/createCustomTypesAPICustomType'
import { createCustomTypesAPIMockedRequest } from './__testutils__/createCustomTypesAPIMockedRequest'
import { createCustomTypesAPISharedSlice } from './__testutils__/createCustomTypesAPISharedSlice'
import { createCustomTypesAPISharedSlicesMockedRequest } from './__testutils__/createCustomTypesAPISharedSlicesMockedRequest'
import { isValidAccessToken } from './__testutils__/isValidAccessToken'
import { resolveURL } from './__testutils__/resolveURL'

import { PluginOptions } from '../src'
import { pluginOptionsSchema } from '../src/plugin-options-schema'

const server = mswn.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.afterEach(() => server.resetHandlers())
test.after(() => server.close())

test.serial('passes on valid options', async (t) => {
  const pluginOptions = {
    repositoryName: 'string',
    accessToken: 'string',
    customTypesApiToken: 'string',
    customTypesApiEndpoint: 'https://example-custom-types-api-endpoint.com',
    apiEndpoint: 'https://example-apiEndpoint.com',
    releaseID: 'string',
    graphQuery: 'string',
    lang: 'string',
    linkResolver: (): void => void 0,
    htmlSerializer: (): void => void 0,
    customTypeModels: [kitchenSinkSchemaFixture],
    sharedSliceModels: [kitchenSinkSharedSliceSchemaFixture],
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { q: 100 },
    typePrefix: 'string',
    webhookSecret: 'string',
    createRemoteFileNode: (): void => void 0,
    transformFieldName: (): void => void 0,
    fetch,
  }

  server.use(
    msw.rest.get(pluginOptions.apiEndpoint, (req, res, ctx) => {
      if (isValidAccessToken(pluginOptions.accessToken, req)) {
        return res(
          ctx.json({
            types: { kitchen_sink: 'Kitchen Sink' },
            refs: [{ ref: 'master', isMasterRef: true }],
          }),
        )
      } else {
        return res(ctx.status(403))
      }
    }),
  )

  server.use(
    msw.rest.get(pluginOptions.customTypesApiEndpoint, (_req, res, ctx) => {
      return res(ctx.json([]))
    }),
  )

  server.use(
    msw.rest.get(
      resolveURL(pluginOptions.customTypesApiEndpoint, '/slices'),
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
    '"htmlSerializer" must be of type function',
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
    schemas: { page: kitchenSinkSchemaFixture },
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
  const pluginOptions = {
    repositoryName: 'qwerty',
    customTypesApiEndpoint: 'https://example.com',
    schemas: { page: kitchenSinkSchemaFixture },
  }
  const apiEndpoint = prismic.getEndpoint(pluginOptions.repositoryName)

  server.use(
    msw.rest.get(apiEndpoint, (_req, res, ctx) =>
      res(
        ctx.json({
          types: { page: 'Page', blogPost: 'Blog Post' },
        }),
      ),
    ),
  )

  server.use(createCustomTypesAPIMockedRequest(pluginOptions, []))

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.true(res.errors.length === 1)
  t.true(/blogPost/.test(res.errors[0]))
})

test.serial(
  'populates customTypeModels if customTypesApiToken is provided',
  async (t) => {
    const pluginOptions = {
      repositoryName: 'qwerty',
      customTypesApiToken: 'customTypesApiToken',
      customTypesApiEndpoint: 'https://example.com',
    }
    const apiEndpoint = prismic.getEndpoint(pluginOptions.repositoryName)

    const customType1 = createCustomTypesAPICustomType()
    const customType2 = createCustomTypesAPICustomType()
    const customTypesResponse = [customType1, customType2]

    const sharedSlice1 = createCustomTypesAPISharedSlice()
    const sharedSlice2 = createCustomTypesAPISharedSlice()
    const sharedSlicesResponse = [sharedSlice1, sharedSlice2]

    server.use(
      msw.rest.get(apiEndpoint, (_req, res, ctx) =>
        res(
          ctx.json({
            types: {
              [customType1.id]: customType1.label,
              [customType2.id]: customType2.label,
            },
          }),
        ),
      ),
    )

    server.use(
      createCustomTypesAPIMockedRequest(pluginOptions, customTypesResponse),
      createCustomTypesAPISharedSlicesMockedRequest(
        pluginOptions,
        sharedSlicesResponse,
      ),
    )

    const schema = pluginOptionsSchema({ Joi })
    const res = (await validateOptionsSchema(
      schema,
      pluginOptions,
    )) as PluginOptions

    t.deepEqual(res.customTypeModels, customTypesResponse)
  },
)

test.serial(
  'merges schemas if customTypesApiToken and schemas are provided',
  async (t) => {
    const customTypeNotInAPI = createCustomTypesAPICustomType()
    const customTypeInAPI1 = createCustomTypesAPICustomType()
    const customTypeInAPI2 = createCustomTypesAPICustomType()
    const customTypesResponse = [customTypeInAPI1, customTypeInAPI2]

    const sharedSliceInAPI1 = createCustomTypesAPISharedSlice()
    const sharedSliceInAPI2 = createCustomTypesAPISharedSlice()
    const sharedSlicesResponse = [sharedSliceInAPI1, sharedSliceInAPI2]

    const pluginOptions = {
      repositoryName: 'qwerty',
      customTypesApiToken: 'customTypesApiToken',
      customTypesApiEndpoint: 'https://example.com',
      customTypeModels: [
        customTypeNotInAPI,

        // Note that we are going to replace customTypeInAPI2 with
        // customTypeNotInAPI, in which customTypeInAPI2 is part of the API
        // response. The test at the end checks for this.
        { ...customTypeNotInAPI, id: customTypeInAPI2.id },
      ],
    }
    const apiEndpoint = prismic.getEndpoint(pluginOptions.repositoryName)

    server.use(
      msw.rest.get(apiEndpoint, (_req, res, ctx) =>
        res(
          ctx.json({
            types: {
              [customTypesResponse[0].id]: customTypesResponse[0].label,
              [customTypesResponse[1].id]: customTypesResponse[1].label,
            },
          }),
        ),
      ),
    )

    server.use(
      createCustomTypesAPIMockedRequest(pluginOptions, customTypesResponse),
      createCustomTypesAPISharedSlicesMockedRequest(
        pluginOptions,
        sharedSlicesResponse,
      ),
    )

    const schema = pluginOptionsSchema({ Joi })
    const res = (await validateOptionsSchema(
      schema,
      pluginOptions,
    )) as PluginOptions

    // TODO: Properly allow overriding types by checking IDs. Prefer models passed via options.
    t.deepEqual(res.customTypeModels, [
      // These custom types were not provided in the plugin options, but is
      // provided by the API.
      customTypeInAPI1,
      customTypeInAPI2,

      // We are testing that a schema provided by the API can be overridden by
      // one provided in plugin options.
      customTypeNotInAPI,

      { ...customTypeNotInAPI, id: customTypeInAPI2.id },
    ])
  },
)
