import test from 'ava'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook } from '@testing-library/react-hooks'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPreviewURL } from './__testutils__/createPreviewURL'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { polyfillKy } from './__testutils__/polyfillKy'
import { resolveURL } from './__testutils__/resolveURL'

import {
  PrismicPreviewProvider,
  UsePrismicPreviewResolverConfig,
  usePrismicPreviewResolver,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'

const createConfig = (): UsePrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.uid}`,
})

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()

  server.listen({ onUnhandledRequest: 'error' })

  browserEnv(['window', 'document'], {
    url: 'https://example.com',
  })
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

test.serial('initial state', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: PrismicPreviewProvider },
  )

  t.true(result.current[0].state === 'INIT')
  t.true(result.current[0].path === undefined)
  t.true(result.current[0].error === undefined)
})

test.serial('fails if documentId is not in URL', async (t) => {
  window.history.replaceState(null, '', createPreviewURL({ token: 'token' }))

  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  cookie.set(prismic.cookie.preview, 'token')

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: PrismicPreviewProvider },
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  t.true(result.current[0].state === 'FAILED')
  t.true(
    result.current[0].error?.message &&
      /documentId URL parameter not present/i.test(
        result.current[0].error?.message,
      ),
  )
})

test.serial('fails if token is not in cookies', async (t) => {
  window.history.replaceState(
    {},
    '',
    createPreviewURL({ documentId: 'documentId', token: 'token' }),
  )

  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: PrismicPreviewProvider },
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  t.true(result.current[0].state === 'FAILED')
  t.true(
    result.current[0].error?.message &&
      /preview cookie not present/i.test(result.current[0].error?.message),
  )
})

test.serial('fails if token does not match repository', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  const token = createPreviewToken('not-this-repository')
  cookie.set(prismic.cookie.preview, token)

  window.history.replaceState(
    {},
    '',
    createPreviewURL({ token, documentId: 'documentId' }),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: PrismicPreviewProvider },
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  t.true(result.current[0].state === 'FAILED')
  t.true(
    result.current[0].error?.message &&
      /token is not for this repository/i.test(
        result.current[0].error?.message,
      ),
  )
})

test.serial('resolves a path using the link resolver', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  const doc = createPrismicAPIDocument()
  const documentId = doc.id
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, token)

  server.use(
    msw.rest.get(
      resolveURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === token &&
        req.url.searchParams.get('lang') === pluginOptions.lang &&
        req.url.searchParams.get('graphQuery') === pluginOptions.graphQuery &&
        req.url.searchParams.get('q') ===
          `[${prismic.predicate.at('document.id', documentId)}]`
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  window.history.replaceState({}, '', createPreviewURL({ token, documentId }))

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForValueToChange } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    { wrapper: PrismicPreviewProvider },
  )
  const resolvePreview = result.current[1]

  t.true(result.current[0].state === 'INIT')

  resolvePreview()

  await waitForValueToChange(() => result.current[0].state)
  t.true(result.current[0].state === 'RESOLVING')

  await waitForValueToChange(() => result.current[0].state)
  t.true(result.current[0].state === 'RESOLVED')
  t.true(result.current[0].path === `/${documentId}`)
  t.true(result.current[0].error === undefined)
})
