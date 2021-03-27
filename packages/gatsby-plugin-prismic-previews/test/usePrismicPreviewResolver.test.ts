import test from 'ava'
import * as mswNode from 'msw/node'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook } from '@testing-library/react-hooks'
import globalJsdom from 'global-jsdom'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewRef } from './__testutils__/createPreviewRef'
import { createPreviewURL } from './__testutils__/createPreviewURL'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { polyfillKy } from './__testutils__/polyfillKy'

import {
  PrismicPreviewProvider,
  UsePrismicPreviewResolverConfig,
  usePrismicPreviewResolver,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

const createConfig = (): UsePrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.uid}`,
})

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()
  globalJsdom(undefined, {
    url: 'https://example.com',
  })
  server.listen({ onUnhandledRequest: 'error' })
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

test.serial('initial state', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
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
  const pluginOptions = createPluginOptions(t)
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
  const pluginOptions = createPluginOptions(t)
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
  const pluginOptions = createPluginOptions(t)
  const config = createConfig()

  const ref = createPreviewRef('not-this-repository')
  cookie.set(prismic.cookie.preview, ref)

  window.history.replaceState(
    {},
    '',
    createPreviewURL({ token: ref, documentId: 'documentId' }),
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
  const pluginOptions = createPluginOptions(t)
  const config = createConfig()

  const doc = createPrismicAPIDocument()
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const ref = createPreviewRef(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, ref)

  window.history.replaceState(
    {},
    '',
    createPreviewURL({ token: ref, documentId: doc.id }),
  )

  server.use(
    createAPIQueryMockedRequest(pluginOptions, queryResponse, {
      ref,
      graphQuery: pluginOptions.graphQuery,
      q: `[${prismic.predicate.at('document.id', doc.id)}]`,
      page: undefined,
      pageSize: undefined,
    }),
  )

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
  t.true(result.current[0].path === `/${doc.id}`)
  t.true(result.current[0].error === undefined)
})
