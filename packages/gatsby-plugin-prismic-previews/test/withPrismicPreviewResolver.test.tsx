import test from 'ava'
import * as sinon from 'sinon'
import * as assert from 'assert'
import * as mswNode from 'msw/node'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import * as gatsby from 'gatsby'
import * as React from 'react'
import * as tlr from '@testing-library/react'
import globalJsdom from 'global-jsdom'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPageProps } from './__testutils__/createPageProps'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewRef } from './__testutils__/createPreviewRef'
import { createPreviewURL } from './__testutils__/createPreviewURL'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { polyfillKy } from './__testutils__/polyfillKy'

import {
  PluginOptions,
  PrismicPreviewProvider,
  WithPrismicPreviewResolverConfig,
  WithPrismicPreviewResolverProps,
  withPrismicPreviewResolver,
} from '../src'
import { onClientEntry } from '../src/on-client-entry'

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()
  globalJsdom(undefined, {
    url: 'https://example.com',
    pretendToBeVisual: true,
  })
  server.listen({ onUnhandledRequest: 'error' })
  console.error = sinon.stub()
})
test.beforeEach(() => {
  clearAllCookies()
  window.history.replaceState(null, '', createPreviewURL())
})
test.afterEach(() => tlr.cleanup())
test.after(() => {
  server.close()
})

const navigateToPreviewResolverURL = (
  token: string,
  documentId: string | null = 'documentId',
) =>
  window.history.replaceState(
    null,
    '',
    createPreviewURL({ token, documentId: documentId ?? undefined }),
  )

const createConfig = (): WithPrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.uid}`,
})

// const fallbackChildren = 'fallback content'
const Page = (props: gatsby.PageProps & WithPrismicPreviewResolverProps) => (
  <div>
    <div data-testid="isPrismicPreview">
      {props.isPrismicPreview === null
        ? 'null'
        : props.isPrismicPreview.toString()}
    </div>
    <div data-testid="prismicPreviewState">{props.prismicPreviewState}</div>
    <div data-testid="prismicPreviewError">
      {props.prismicPreviewError?.message}
    </div>
    <div data-testid="prismicPreviewPath">{props.prismicPreviewPath}</div>
  </div>
)

const createTree = (
  pluginOptions: PluginOptions,
  pageProps: gatsby.PageProps,
  config: WithPrismicPreviewResolverConfig,
) => {
  const WrappedPage = withPrismicPreviewResolver(
    Page,
    pluginOptions.repositoryName,
    config,
  )

  return (
    <PrismicPreviewProvider>
      <WrappedPage {...pageProps} />
    </PrismicPreviewProvider>
  )
}

test.serial('renders component if not a preview', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const pageProps = createPageProps()
  const config = createConfig()
  const tree = createTree(pluginOptions, pageProps, config)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  t.true(result.getByTestId('isPrismicPreview').textContent === 'false')
  t.true((pageProps.navigate as sinon.SinonStub).notCalled)
})

test.serial('fails if documentId is not in URL', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const pageProps = createPageProps()
  const config = createConfig()
  const tree = createTree(pluginOptions, pageProps, config)
  const token = createPreviewRef(pluginOptions.repositoryName)

  navigateToPreviewResolverURL(token, null)
  cookie.set(prismic.cookie.preview, token)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  await tlr.waitFor(() =>
    assert.ok(
      result.getByTestId('prismicPreviewState').textContent === 'FAILED',
    ),
  )

  t.true(result.getByTestId('isPrismicPreview').textContent === 'true')
  t.true(result.getByTestId('prismicPreviewState').textContent === 'FAILED')
  t.true(
    /documentId URL parameter not present/i.test(
      result.getByTestId('prismicPreviewError').textContent ?? '',
    ),
  )
  t.true((pageProps.navigate as sinon.SinonStub).notCalled)
})

test.serial('fails if token is not in cookies', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const pageProps = createPageProps()
  const config = createConfig()
  const tree = createTree(pluginOptions, pageProps, config)
  const token = createPreviewRef(pluginOptions.repositoryName)

  navigateToPreviewResolverURL(token)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  await tlr.waitFor(() =>
    assert.ok(
      result.getByTestId('prismicPreviewState').textContent === 'FAILED',
    ),
  )

  t.true(result.getByTestId('isPrismicPreview').textContent === 'true')
  t.true(result.getByTestId('prismicPreviewState').textContent === 'FAILED')
  t.true(
    /preview cookie not present/i.test(
      result.getByTestId('prismicPreviewError').textContent ?? '',
    ),
  )
  t.true((pageProps.navigate as sinon.SinonStub).notCalled)
})

test.serial('not a preview if token does not match repository', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const pageProps = createPageProps()
  const config = createConfig()
  const tree = createTree(pluginOptions, pageProps, config)
  const token = createPreviewRef('not-this-repository')

  navigateToPreviewResolverURL(token)
  cookie.set(prismic.cookie.preview, token)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  t.true(result.getByTestId('isPrismicPreview').textContent === 'false')
  t.true((pageProps.navigate as sinon.SinonStub).notCalled)
})

test.serial('redirects to path on valid preview', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const pageProps = createPageProps()
  const config = createConfig()
  const tree = createTree(pluginOptions, pageProps, config)
  const ref = createPreviewRef(pluginOptions.repositoryName)

  const doc = createPrismicAPIDocument()
  const queryResponse = createPrismicAPIQueryResponse([doc])

  navigateToPreviewResolverURL(ref, doc.id)
  cookie.set(prismic.cookie.preview, ref)

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
  tlr.render(tree)

  await tlr.waitFor(() =>
    assert.ok((pageProps.navigate as sinon.SinonStub).called),
  )

  t.true(
    (pageProps.navigate as sinon.SinonStub).calledWith(
      config.linkResolver(doc),
    ),
  )
})

test.serial(
  'does not redirect on valid preview if autoRedirect is false',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    const pageProps = createPageProps()
    const config = createConfig()
    config.autoRedirect = false
    const tree = createTree(pluginOptions, pageProps, config)
    const ref = createPreviewRef(pluginOptions.repositoryName)

    const doc = createPrismicAPIDocument()
    const queryResponse = createPrismicAPIQueryResponse([doc])

    navigateToPreviewResolverURL(ref, doc.id)
    cookie.set(prismic.cookie.preview, ref)

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
    const result = tlr.render(tree)

    await tlr.waitFor(() =>
      assert.ok(result.getByTestId('prismicPreviewPath').textContent),
    )

    t.true(
      result.getByTestId('prismicPreviewPath').textContent ===
        config.linkResolver(doc),
    )
    t.true((pageProps.navigate as sinon.SinonStub).notCalled)
  },
)
