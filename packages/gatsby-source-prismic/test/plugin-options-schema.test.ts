import test from 'ava'
import * as msw from 'msw'
import * as mswn from 'msw/node'
import * as prismic from 'ts-prismic'
import { testPluginOptionsSchema } from 'gatsby-plugin-utils'

import kitchenSinkSchemaFixture from './__fixtures__/kitchenSinkSchema.json'

import { pluginOptionsSchema } from '../src/plugin-options-schema'

const server = mswn.setupServer()
test.before(() => server.listen({ onUnhandledRequest: 'error' }))
test.after(() => server.close())

test('passes on valid options', async (t) => {
  const pluginOptions = {
    repositoryName: 'string',
    accessToken: 'string',
    apiEndpoint: 'https://example.com',
    releaseID: 'string',
    graphQuery: 'string',
    lang: 'string',
    linkResolver: (): void => void 0,
    htmlSerializer: (): void => void 0,
    schemas: { page: kitchenSinkSchemaFixture },
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { q: 100 },
    typePrefix: 'string',
    webhookSecret: 'string',
    createRemoteFileNode: (): void => void 0,
  }

  server.use(
    msw.rest.get(pluginOptions.apiEndpoint, (req, res, ctx) =>
      req.url.searchParams.get('access_token') === pluginOptions.accessToken
        ? res(
            ctx.json({
              types: { page: 'Page' },
              refs: [{ ref: 'master', isMasterRef: true }],
            }),
          )
        : res(ctx.status(401)),
    ),
  )

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.true(res.isValid)
  t.deepEqual(res.errors, [])
})

test('fails on missing options', async (t) => {
  const pluginOptions = {}
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"repositoryName" is required',
    '"schemas" is required',
  ])
})

test('fails on invalid options', async (t) => {
  const pluginOptions = {
    repositoryName: Symbol(),
    accessToken: Symbol(),
    apiEndpoint: Symbol(),
    releaseID: Symbol(),
    graphQuery: Symbol(),
    lang: Symbol(),
    linkResolver: Symbol(),
    htmlSerializer: Symbol(),
    schemas: Symbol(),
    imageImgixParams: Symbol(),
    imagePlaceholderImgixParams: Symbol(),
    typePrefix: Symbol(),
    webhookSecret: Symbol(),
    createRemoteFileNode: Symbol(),
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"repositoryName" must be a string',
    '"accessToken" must be a string',
    '"apiEndpoint" must be a string',
    '"releaseID" must be a string',
    '"graphQuery" must be a string',
    '"lang" must be a string',
    '"linkResolver" must be of type function',
    '"htmlSerializer" must be of type function',
    '"schemas" must be of type object',
    '"imageImgixParams" must be of type object',
    '"imagePlaceholderImgixParams" must be of type object',
    '"typePrefix" must be a string',
    '"webhookSecret" must be a string',
    '"createRemoteFileNode" must be of type function',
  ])
})

test('allows only one of qraphQuery or fetchLinks', async (t) => {
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

test('checks that all schemas are provided', async (t) => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    schemas: { page: kitchenSinkSchemaFixture },
  }
  const apiEndpoint = prismic.defaultEndpoint(pluginOptions.repositoryName)

  server.use(
    msw.rest.get(apiEndpoint, (_req, res, ctx) =>
      res(
        ctx.json({
          types: { page: 'Page', blogPost: 'Blog Post' },
        }),
      ),
    ),
  )

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.true(res.errors.length === 1)
  t.true(/blogPost/.test(res.errors[0]))
})
