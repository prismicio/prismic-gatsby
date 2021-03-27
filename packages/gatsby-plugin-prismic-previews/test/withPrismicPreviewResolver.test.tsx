import test from 'ava'
import * as sinon from 'sinon'
import * as mswNode from 'msw/node'
// import * as cookie from 'es-cookie'
import * as gatsby from 'gatsby'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
// import { render, screen } from '@testing-library/react'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { polyfillKy } from './__testutils__/polyfillKy'

import {
  PluginOptions,
  PrismicPreviewProvider,
  withPrismicPreviewResolver,
  WithPrismicPreviewResolverConfig,
  WithPrismicPreviewResolverProps,
  // WithPrismicPreviewResolverProps,
} from '../src'
import { onClientEntry } from '../src/on-client-entry'

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()
  browserEnv(['window', 'document'], {
    url: 'https://example.com',
    pretendToBeVisual: true,
  })
  server.listen({ onUnhandledRequest: 'error' })
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

const createConfig = (): WithPrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.uid}`,
})

const createPageProps = <TData extends Record<PropertyKey, unknown>>(
  data: TData = {} as TData,
): gatsby.PageProps => ({
  path: '/',
  uri: '/',
  // @ts-expect-error - Partial Location provided
  location: {},
  // @ts-expect-error - Partial navigate provided
  navigate: sinon.stub(),
  children: undefined,
  params: {},
  // @ts-expect-error - Partial pageResources provided
  pageResources: {},
  data,
  pageContext: {},
})

const fallbackChildren = 'fallback content'
const Page = (_props: gatsby.PageProps & WithPrismicPreviewResolverProps) => (
  <>{fallbackChildren}</>
)

const createTree = (
  pluginOptions: PluginOptions,
  pageProps: gatsby.PageProps,
) => {
  const config = createConfig()

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
  const tree = createTree(pluginOptions, pageProps)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const testRenderer = renderer.create(tree)
  const testInstance = testRenderer.root
  const pageComp = testInstance.findByType(Page)

  t.true(pageComp.props.isPrismicPreview === null)

  testRenderer.update(tree)

  t.true(pageComp.props.isPrismicPreview === false)
  t.true(pageComp.children[0] === fallbackChildren)
  t.true((pageProps.navigate as sinon.SinonStub).notCalled)
})
