import nock from 'nock'
import * as prismic from 'ts-prismic'
import { testPluginOptionsSchema } from 'gatsby-plugin-utils'

import { pluginOptionsSchema } from '../src/plugin-options-schema'

import kitchenSinkSchemaFixture from './__fixtures__/kitchenSinkSchema.json'

test('passes on valid options', async () => {
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
  }

  nock(pluginOptions.apiEndpoint)
    .get('/')
    .query({ access_token: pluginOptions.accessToken })
    .reply(200, {
      types: { page: 'Page' },
      refs: [{ ref: 'master', isMasterRef: true }],
    })

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(true)
  expect(res.errors).toEqual([])
})

test('fails on missing options', async () => {
  const pluginOptions = {}
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
    '"repositoryName" is required',
    '"schemas" is required',
  ])
})

test('fails on invalid options', async () => {
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
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
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
  ])
})

test('allows only one of qraphQuery or fetchLinks', async () => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    schemas: { page: kitchenSinkSchemaFixture },
    graphQuery: 'string',
    fetchLinks: ['string'],
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
    '"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
  ])
})

test('checks that all schemas are provided', async () => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    schemas: { page: kitchenSinkSchemaFixture },
  }

  const url = prismic.defaultEndpoint(pluginOptions.repositoryName)
  const origin = new URL(url).origin

  nock(origin)
    .get('/api/v2')
    .reply(200, { types: { page: 'Page', blogPost: 'Blog Post' } })

  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([expect.stringContaining('blogPost')])
})
