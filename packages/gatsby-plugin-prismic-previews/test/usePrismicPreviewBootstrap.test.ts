import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import md5 from 'tiny-hashes/md5'
import nock from 'nock'
import 'cross-fetch/polyfill'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

import {
  createPrismicContext,
  PrismicAPIDocumentNodeInput,
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapConfig,
  usePrismicPreviewContext,
} from '../src'

const createConfig = (): UsePrismicPreviewBootstrapConfig => ({
  linkResolver: (doc): string => `/${doc.id}`,
})

const nodeHelpers = createNodeHelpers({
  typePrefix: 'Prismic prefix',
  fieldPrefix: 'Prismic',
  createNodeId: (id) => md5(id),
  createContentDigest: (input) => md5(JSON.stringify(input)),
})

declare global {
  interface Window {
    __BASE_PATH__: string
  }
}

window.__BASE_PATH__ = 'https://example.com'

beforeEach(() => {
  clearAllCookies()
})

test('initial state', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const { result } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const state = result.current[0]

  expect(state.state).toBe('INIT')
  expect(state.error).toBeUndefined()
})

test('fails if not a preview session - cookie is not set', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current[1]

  act(() => {
    bootstrapPreview()
  })

  await waitForNextUpdate()

  const state = result.current[0]

  expect(state.state).toBe('FAILED')
  expect(state.error?.message).toMatch(/not a preview session/i)
})

test('fails if not for this repository', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const token = createPreviewToken('not-this-repository')
  cookie.set(prismic.cookie.preview, token)

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current[1]

  act(() => {
    bootstrapPreview()
  })

  await waitForNextUpdate()

  const state = result.current[0]

  expect(state.state).toBe('FAILED')
  expect(state.error?.message).toMatch(/token is not for this repository/i)
})

test('fetches all repository documents and bootstraps context', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, token)

  const queryResults = [
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
  ]
  const queryResultsNodes = queryResults.map(
    (doc) =>
      nodeHelpers.createNodeFactory(doc.type)(
        doc,
      ) as PrismicAPIDocumentNodeInput,
  )

  nock(new URL(pluginOptions.apiEndpoint).origin)
    .get('/api/v2/documents/search')
    .query({
      ref: token,
      access_token: pluginOptions.accessToken,
      lang: pluginOptions.lang,
      graphQuery: pluginOptions.graphQuery,
      page: 1,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 2,
      results: queryResults.slice(0, 2),
    })

  nock(new URL(pluginOptions.apiEndpoint).origin)
    .get('/api/v2/documents/search')
    .query({
      ref: token,
      access_token: pluginOptions.accessToken,
      lang: pluginOptions.lang,
      graphQuery: pluginOptions.graphQuery,
      page: 2,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 2,
      results: queryResults.slice(2),
    })

  nock(window.__BASE_PATH__)
    .get('/static/9e387d94c04ebf0e369948edd9c66d2b.json')
    .reply(200, '{}')

  const { result, waitForValueToChange } = renderHook(
    () => {
      const context = usePrismicPreviewContext(pluginOptions.repositoryName)
      const bootstrap = usePrismicPreviewBootstrap(
        pluginOptions.repositoryName,
        config,
      )

      return { bootstrap, context }
    },
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current.bootstrap[1]

  expect(result.current.bootstrap[0].state).toBe('INIT')

  act(() => {
    bootstrapPreview()
  })

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPING')

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPED')
  expect(result.current.bootstrap[0].error).toBeUndefined()
  expect(result.current.context[0].isBootstrapped).toBe(true)
  expect(result.current.context[0].nodes).toEqual({
    [queryResultsNodes[0].prismicId]: queryResultsNodes[0],
    [queryResultsNodes[1].prismicId]: queryResultsNodes[1],
    [queryResultsNodes[2].prismicId]: queryResultsNodes[2],
    [queryResultsNodes[3].prismicId]: queryResultsNodes[3],
  })
})

test('fails if already bootstrapped', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, token)

  const queryResults = [
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
  ]

  nock(new URL(pluginOptions.apiEndpoint).origin)
    .get('/api/v2/documents/search')
    .query({
      ref: token,
      access_token: pluginOptions.accessToken,
      lang: pluginOptions.lang,
      graphQuery: pluginOptions.graphQuery,
      page: 1,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 2,
      results: queryResults.slice(0, 2),
    })

  nock(new URL(pluginOptions.apiEndpoint).origin)
    .get('/api/v2/documents/search')
    .query({
      ref: token,
      access_token: pluginOptions.accessToken,
      lang: pluginOptions.lang,
      graphQuery: pluginOptions.graphQuery,
      page: 2,
      pageSize: 100,
    })
    .reply(200, {
      total_pages: 2,
      results: queryResults.slice(2),
    })

  nock(window.__BASE_PATH__)
    .get('/static/9e387d94c04ebf0e369948edd9c66d2b.json')
    .reply(200, '{}')

  const { result, waitForValueToChange } = renderHook(
    () => {
      const context = usePrismicPreviewContext(pluginOptions.repositoryName)
      const bootstrap = usePrismicPreviewBootstrap(
        pluginOptions.repositoryName,
        config,
      )

      return { bootstrap, context }
    },
    { wrapper: Provider },
  )

  expect(result.current.bootstrap[0].state).toBe('INIT')

  // Bootstrap the first time.
  act(() => {
    result.current.bootstrap[1]()
  })

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPING')

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPED')
  expect(result.current.bootstrap[0].error).toBeUndefined()

  // Bootstrap the second time.
  act(() => {
    result.current.bootstrap[1]()
  })

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  expect(result.current.bootstrap[0].state).toBe('FAILED')
  expect(result.current.bootstrap[0].error?.message).toMatch(
    /already been bootstrapped/i,
  )
})
