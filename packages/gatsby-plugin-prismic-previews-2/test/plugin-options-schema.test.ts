import { testPluginOptionsSchema } from 'gatsby-plugin-utils'

import { pluginOptionsSchema } from '../src/plugin-options-schema'

test('passes on valid options', async () => {
  const pluginOptions = {
    repositoryName: 'string',
    accessToken: 'string',
    apiEndpoint: 'string',
    graphQuery: 'string',
    lang: 'string',
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { q: 100 },
    typePrefix: 'string',
    toolbar: 'new',
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  // expect(res.isValid).toBe(true)
  expect(res.errors).toEqual([])
})

test('fails on missing options', async () => {
  const pluginOptions = {}
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual(['"repositoryName" is required'])
})

test('fails on invalid options', async () => {
  const pluginOptions = {
    repositoryName: Symbol(),
    accessToken: Symbol(),
    apiEndpoint: Symbol(),
    graphQuery: Symbol(),
    lang: Symbol(),
    imageImgixParams: Symbol(),
    imagePlaceholderImgixParams: Symbol(),
    typePrefix: Symbol(),
    toolbar: Symbol(),
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
    '"repositoryName" must be a string',
    '"accessToken" must be a string',
    '"apiEndpoint" must be a string',
    '"graphQuery" must be a string',
    '"lang" must be a string',
    '"imageImgixParams" must be of type object',
    '"imagePlaceholderImgixParams" must be of type object',
    '"typePrefix" must be a string',
    '"toolbar" must be one of [new, legacy]',
    '"toolbar" must be a string',
  ])
})

test('allows only one of qraphQuery or fetchLinks', async () => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    graphQuery: 'string',
    fetchLinks: ['string'],
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
    '"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
  ])
})

test('allows only one of accessToken or promptForAccessToken', async () => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    accessToken: 'string',
    promptForAccessToken: false,
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  expect(res.isValid).toBe(false)
  expect(res.errors).toEqual([
    '"value" contains a conflict between optional exclusive peers [accessToken, promptForAccessToken]',
  ])
})
