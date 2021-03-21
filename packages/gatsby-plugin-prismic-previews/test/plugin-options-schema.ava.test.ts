import test from 'ava'
import { testPluginOptionsSchema } from 'gatsby-plugin-utils'

import { pluginOptionsSchema } from '../src/gatsby-node'

test('passes on valid options', async (t) => {
  const pluginOptions = {
    repositoryName: 'string',
    accessToken: 'string',
    promptForAccessToken: true,
    apiEndpoint: 'string',
    graphQuery: 'string',
    lang: 'string',
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { q: 100 },
    typePrefix: 'string',
    toolbar: 'new',
    writeTypePathsToFilesystem: () => void 0,
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.true(res.isValid)
  t.deepEqual(res.errors, [])
})

test('fails on missing options', async (t) => {
  const pluginOptions = {}
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, ['"repositoryName" is required'])
})

test('fails on invalid options', async (t) => {
  const pluginOptions = {
    repositoryName: Symbol(),
    accessToken: Symbol(),
    promptForAccessToken: Symbol(),
    apiEndpoint: Symbol(),
    graphQuery: Symbol(),
    lang: Symbol(),
    imageImgixParams: Symbol(),
    imagePlaceholderImgixParams: Symbol(),
    typePrefix: Symbol(),
    toolbar: Symbol(),
    writeTypePathsToFilesystem: Symbol(),
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"repositoryName" must be a string',
    '"accessToken" must be a string',
    '"promptForAccessToken" must be a boolean',
    '"apiEndpoint" must be a string',
    '"graphQuery" must be a string',
    '"lang" must be a string',
    '"imageImgixParams" must be of type object',
    '"imagePlaceholderImgixParams" must be of type object',
    '"typePrefix" must be a string',
    '"toolbar" must be one of [new, legacy]',
    '"toolbar" must be a string',
    '"writeTypePathsToFilesystem" must be of type function',
  ])
})

test('allows only one of qraphQuery or fetchLinks', async (t) => {
  const pluginOptions = {
    repositoryName: 'qwerty',
    graphQuery: 'string',
    fetchLinks: ['string'],
  }
  const res = await testPluginOptionsSchema(pluginOptionsSchema, pluginOptions)

  t.false(res.isValid)
  t.deepEqual(res.errors, [
    '"value" contains a conflict between optional exclusive peers [fetchLinks, graphQuery]',
  ])
})
