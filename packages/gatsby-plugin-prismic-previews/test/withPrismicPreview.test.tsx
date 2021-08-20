import test from 'ava'
import * as assert from 'assert'
import * as mswNode from 'msw/node'
import * as prismic from '@prismicio/client'
import * as prismicMock from '@prismicio/mock'
import * as cookie from 'es-cookie'
import * as gatsby from 'gatsby'
import * as React from 'react'
import * as tlr from '@testing-library/react'
import globalJsdom from 'global-jsdom'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createAPIRepositoryMockedRequest } from './__testutils__/createAPIRepositoryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPageProps } from './__testutils__/createPageProps'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewRef } from './__testutils__/createPreviewRef'
import { createPreviewURL } from './__testutils__/createPreviewURL'
import { createRuntime } from './__testutils__/createRuntime'
import { createTypePathsMockedRequest } from './__testutils__/createTypePathsMockedRequest'
import { jsonFilter } from './__testutils__/jsonFilter'
import { polyfillKy } from './__testutils__/polyfillKy'

import {
  PluginOptions,
  PrismicPreviewProvider,
  PrismicRepositoryConfigs,
  UnknownRecord,
  WithPrismicPreviewConfig,
  WithPrismicPreviewProps,
  withPrismicPreview,
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
  globalThis.__PATH_PREFIX__ = 'https://example.com'
  // console.error = sinon.stub()
})
test.beforeEach(() => {
  clearAllCookies()
  window.history.replaceState(null, '', createPreviewURL())
})
test.afterEach(() => tlr.cleanup())
test.after(() => {
  server.close()
})

const createRepositoryConfigs = (
  pluginOptions: PluginOptions,
): PrismicRepositoryConfigs => [
  {
    repositoryName: pluginOptions.repositoryName,
    linkResolver: (doc): string => `/${doc.uid}`,
  },
]

const Page = <TProps extends UnknownRecord = UnknownRecord>(
  props: gatsby.PageProps<TProps> & WithPrismicPreviewProps<TProps>,
) => (
  <div>
    <div data-testid="isPrismicPreview">
      {props.isPrismicPreview === null
        ? 'null'
        : props.isPrismicPreview.toString()}
    </div>
    <div data-testid="prismicPreviewOriginalData">
      {JSON.stringify(props.prismicPreviewOriginalData)}
    </div>
    <div data-testid="data">{JSON.stringify(props.data)}</div>
  </div>
)

const createTree = (
  pageProps: gatsby.PageProps,
  repositoryConfigs: PrismicRepositoryConfigs,
  config?: WithPrismicPreviewConfig,
) => {
  const WrappedPage = withPrismicPreview(Page, repositoryConfigs, config)

  return (
    <PrismicPreviewProvider>
      {/*
       // @ts-expect-error - Partial pageResources provided */}
      <WrappedPage {...pageProps} />
    </PrismicPreviewProvider>
  )
}

test.serial(
  'does not merge data if no preview data is available',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    const config = createRepositoryConfigs(pluginOptions)

    const model = prismicMock.model.customType()
    const documents = Array(20)
      .fill(undefined)
      .map(() => prismicMock.value.document({ model }))

    const runtime = createRuntime(pluginOptions, config[0])
    runtime.registerCustomTypeModels([model])
    runtime.registerDocuments(documents)

    // Need to use the query results nodes rather than new documents to ensure
    // the IDs match.
    const staticData = jsonFilter({
      previewable: runtime.nodes[0],
      nonPreviewable: runtime.nodes[1],
    })
    staticData.previewable._previewable = runtime.nodes[0].prismicId
    // Marking this data as "old" and should be replaced during the merge.
    staticData.previewable.uid = 'old'

    const pageProps = createPageProps(staticData)
    const tree = createTree(pageProps, config)

    // @ts-expect-error - Partial gatsbyContext provided
    await onClientEntry(gatsbyContext, pluginOptions)
    const result = tlr.render(tree)

    // Because a preview ref was not set, preview data was not fetched. The
    // component should render static data.
    t.true(
      result.getByTestId('data').textContent ===
        result.getByTestId('prismicPreviewOriginalData').textContent,
    )
  },
)

test.serial('merges data if preview data is available', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const model = prismicMock.model.customType()
  const documents = Array(20)
    .fill(undefined)
    .map(() => prismicMock.value.document({ model }))
  const queryResponse = prismicMock.api.query({ documents })

  const runtime = createRuntime(pluginOptions, config[0])
  runtime.registerCustomTypeModels([model])
  runtime.registerDocuments(documents)

  const ref = createPreviewRef(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, ref)

  server.use(
    createAPIRepositoryMockedRequest(pluginOptions),
    createAPIQueryMockedRequest(pluginOptions, queryResponse, {
      ref,
    }),
    createTypePathsMockedRequest(
      'a9101d270279c16322571b8448d7a329.json',
      runtime.typePaths,
    ),
  )

  // Need to use the query results nodes rather than new documents to ensure
  // the IDs match.
  const staticData = jsonFilter({
    previewable: runtime.nodes[0],
    nonPreviewable: runtime.nodes[1],
  })
  staticData.previewable._previewable = runtime.nodes[0].prismicId
  // Marking this data as "old" and should be replaced during the merge.
  staticData.previewable.uid = 'old'

  const pageProps = createPageProps(staticData)
  const tree = createTree(pageProps, config)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  await tlr.waitFor(() =>
    assert.ok(
      result.getByTestId('data').textContent !==
        result.getByTestId('prismicPreviewOriginalData').textContent,
    ),
  )

  const propData = JSON.parse(result.getByTestId('data').textContent ?? '{}')
  const mergedData = jsonFilter({
    ...staticData,
    previewable: runtime.nodes[0],
  })
  t.deepEqual(propData, mergedData)
})

test.serial('handles custom types without a data field', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const model = prismicMock.model.customType()
  const documents = Array(20)
    .fill(undefined)
    .map(() => prismicMock.value.document({ model }))
  const queryResponse = prismicMock.api.query({ documents })

  const runtime = createRuntime(pluginOptions, config[0])
  runtime.registerCustomTypeModels([model])
  runtime.registerDocuments(documents)

  const ref = createPreviewRef(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, ref)

  server.use(
    createAPIRepositoryMockedRequest(pluginOptions),
    createAPIQueryMockedRequest(pluginOptions, queryResponse, {
      ref,
    }),
    createTypePathsMockedRequest(
      'eac4669530f66bef76da4016f1111055.json',
      runtime.typePaths,
    ),
  )

  // Need to use the query results nodes rather than new documents to ensure
  // the IDs match.
  const staticData = jsonFilter({
    previewable: runtime.nodes[0],
    nonPreviewable: runtime.nodes[1],
  })
  staticData.previewable._previewable = runtime.nodes[0].prismicId
  // Marking this data as "old" and should be replaced during the merge.
  staticData.previewable.uid = 'old'

  const pageProps = createPageProps(staticData)
  const tree = createTree(pageProps, config)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const result = tlr.render(tree)

  await tlr.waitFor(() =>
    assert.ok(
      result.getByTestId('data').textContent !==
        result.getByTestId('prismicPreviewOriginalData').textContent,
    ),
  )

  const propData = JSON.parse(result.getByTestId('data').textContent ?? '{}')
  const mergedData = jsonFilter({
    ...staticData,
    previewable: runtime.nodes[0],
  })
  t.deepEqual(propData, mergedData)
})
