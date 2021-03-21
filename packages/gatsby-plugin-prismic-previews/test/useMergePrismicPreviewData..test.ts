import test from 'ava'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import md5 from 'tiny-hashes/md5'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPrismicAPIDocumentNodeInput } from './__testutils__/createPrismicAPIDocumentNodeInput'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { polyfillKy } from './__testutils__/polyfillKy'
import { resolveURL } from './__testutils__/resolveURL'

import {
  PrismicAPIDocumentNodeInput,
  PrismicPreviewProvider,
  UsePrismicPreviewBootstrapConfig,
  useMergePrismicPreviewData,
  usePrismicPreviewBootstrap,
  usePrismicPreviewContext,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

const createStaticData = () => {
  const previewable = createPrismicAPIDocumentNodeInput({ text: 'static' })
  previewable._previewable = previewable.prismicId

  const nonPreviewable = createPrismicAPIDocumentNodeInput({ text: 'static' })

  return { previewable, nonPreviewable }
}

const createConfig = (): UsePrismicPreviewBootstrapConfig => ({
  linkResolver: (doc): string => `/${doc.id}`,
})

const nodeHelpers = createNodeHelpers({
  typePrefix: 'Prismic prefix',
  fieldPrefix: 'Prismic',
  createNodeId: (id) => md5(id),
  createContentDigest: (input) => md5(JSON.stringify(input)),
})

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()

  server.listen({ onUnhandledRequest: 'error' })

  browserEnv(['window', 'document'])

  globalThis.__PATH_PREFIX__ = 'https://example.com'
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

test.serial('does not merge if no preview data is available', async (t) => {
  const pluginOptions = createPluginOptions()
  const gatsbyContext = createGatsbyContext()
  const staticData = createStaticData()

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(
    () => useMergePrismicPreviewData(pluginOptions.repositoryName, staticData),
    { wrapper: PrismicPreviewProvider },
  )

  t.false(result.current.isPreview)
  t.true(result.current.data === staticData)
})

test.serial(
  'merges data only where `_previewable` field matches',
  async (t) => {
    const pluginOptions = createPluginOptions()
    const gatsbyContext = createGatsbyContext()
    const config = createConfig()
    const queryResponse = createPrismicAPIQueryResponse()

    const token = createPreviewToken(pluginOptions.repositoryName)
    cookie.set(prismic.cookie.preview, token)

    const queryResponseNodes = queryResponse.results.map(
      (doc) =>
        nodeHelpers.createNodeFactory(doc.type)(
          doc,
        ) as PrismicAPIDocumentNodeInput,
    )

    server.use(
      msw.rest.get(
        resolveURL(pluginOptions.apiEndpoint, './documents/search'),
        (req, res, ctx) =>
          req.url.searchParams.get('access_token') ===
            pluginOptions.accessToken &&
          req.url.searchParams.get('ref') === token &&
          req.url.searchParams.get('lang') === pluginOptions.lang &&
          req.url.searchParams.get('graphQuery') === pluginOptions.graphQuery &&
          req.url.searchParams.get('page') === '1' &&
          req.url.searchParams.get('pageSize') === '100'
            ? res(ctx.json(queryResponse))
            : res(ctx.status(401)),
      ),
    )

    server.use(
      msw.rest.get(
        resolveURL(
          globalThis.__PATH_PREFIX__,
          '/static/9e387d94c04ebf0e369948edd9c66d2b.json',
        ),
        (_req, res, ctx) =>
          res(
            ctx.json({
              type: gatsbyPrismic.PrismicSpecialType.Document,
              'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
            }),
          ),
      ),
    )

    // Need to use the query results nodes rather than new documents to ensure
    // the IDs match.
    const staticData = {
      previewable: { ...queryResponseNodes[0] },
      nonPreviewable: { ...queryResponseNodes[1] },
    }
    staticData.previewable._previewable = queryResponseNodes[0].prismicId
    // Marking this data as "old" and should be replaced during the merge.
    staticData.previewable.uid = 'old'

    // @ts-expect-error - Partial gatsbyContext provided
    await onClientEntry(gatsbyContext, pluginOptions)

    const { result, waitForValueToChange } = renderHook(
      () => {
        const context = usePrismicPreviewContext(pluginOptions.repositoryName)
        const bootstrap = usePrismicPreviewBootstrap(
          pluginOptions.repositoryName,
          config,
        )

        const mergedData = useMergePrismicPreviewData(
          pluginOptions.repositoryName,
          staticData,
        )

        return { bootstrap, context, mergedData }
      },
      { wrapper: PrismicPreviewProvider },
    )
    const bootstrapPreview = result.current.bootstrap[1]

    act(() => {
      bootstrapPreview()
    })

    await waitForValueToChange(() => result.current.bootstrap[0].state)
    t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPING')

    await waitForValueToChange(() => result.current.bootstrap[0].state)
    t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPED')

    t.true(result.current.mergedData.isPreview)
    t.true(
      result.current.mergedData.data.previewable.uid ===
        queryResponseNodes[0].uid,
    )
  },
)

// // test('recursively merges data', () => {})

// // test('allows skipping', () => {})
