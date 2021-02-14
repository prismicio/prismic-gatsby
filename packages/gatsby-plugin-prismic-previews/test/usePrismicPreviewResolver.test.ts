import { renderHook, act } from '@testing-library/react-hooks'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import nock from 'nock'
import 'cross-fetch/polyfill'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPreviewURL } from './__testutils__/createPreviewURL'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

import {
  createPrismicContext,
  usePrismicPreviewResolver,
  UsePrismicPreviewResolverConfig,
} from '../src'

const createConfig = (): UsePrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.id}`,
})

beforeEach(() => {
  window.history.replaceState({}, '', '')
  clearAllCookies()
})

test('initial state', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )

  expect(result.current[0].state).toBe('INIT')
  expect(result.current[0].path).toBe(undefined)
  expect(result.current[0].error).toBe(undefined)
})

test('fails if documentId is not in URL', async () => {
  window.history.replaceState({}, '', createPreviewURL({ token: 'token' }))

  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  cookie.set(prismic.cookie.preview, 'token')

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /documentId URL parameter not present/i,
  )
})

test('fails if token is not in cookies', async () => {
  window.history.replaceState(
    {},
    '',
    createPreviewURL({ documentId: 'documentId', token: 'token' }),
  )

  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /preview cookie not present/i,
  )
})

test('fails if token does not match repository', async () => {
  const pluginOptions = createPluginOptions()
  const token = encodeURIComponent(`https://no-match.prismic.io/previews/token`)
  cookie.set(prismic.cookie.preview, token)

  window.history.replaceState(
    {},
    '',
    createPreviewURL({ token, documentId: 'documentId' }),
  )

  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /token is not for this repository/i,
  )
})

test('resolves a path using the link resolver', async () => {
  const pluginOptions = createPluginOptions()
  const token = createPreviewToken(pluginOptions.repositoryName)
  const doc = createPrismicAPIDocument()
  const documentId = doc.id
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  nock(new URL(pluginOptions.apiEndpoint).origin)
    .get('/api/v2/documents/search')
    .query({
      ref: token,
      access_token: pluginOptions.accessToken,
      lang: pluginOptions.lang,
      graphQuery: pluginOptions.graphQuery,
      q: `[${prismic.predicate.at('document.id', documentId)}]`,
    })
    .reply(200, {
      total_pages: 1,
      results: [doc],
    })

  window.history.replaceState({}, '', createPreviewURL({ token, documentId }))
  cookie.set(prismic.cookie.preview, token)

  const { result, waitForValueToChange } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const resolvePreview = result.current[1]

  expect(result.current[0].state).toBe('INIT')

  act(() => {
    resolvePreview()
  })

  await waitForValueToChange(() => result.current[0].state)
  expect(result.current[0].state).toBe('RESOLVING')

  await waitForValueToChange(() => result.current[0].state)
  expect(result.current[0].state).toBe('RESOLVED')
  expect(result.current[0].path).toBe(`/${documentId}`)
  expect(result.current[0].error).toBeUndefined()
})
