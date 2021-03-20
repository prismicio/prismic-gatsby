import test from 'ava'
import * as sinon from 'sinon'
import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import md5 from 'tiny-hashes/md5'
import nock from 'nock'
import 'cross-fetch/polyfill'
import { JSDOM } from 'jsdom'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIDocumentNodeInput } from './__testutils__/createPrismicAPIDocumentNodeInput'

import {
  createPrismicContext,
  PrismicAPIDocumentNodeInput,
  useMergePrismicPreviewData,
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapConfig,
  usePrismicPreviewContext,
  PrismicPreviewProvider,
} from '../src'
import { onClientEntry } from '../src/on-client-entry'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'

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

declare global {
  interface Window {
    __BASE_PATH__: string
  }
}

test.beforeEach(() => {
  globalThis.window = new JSDOM().window

  // This global variable is used by Gatsby's `withAssetPrefix` to build a URL
  // using the site's domain.
  //
  // A site would set this variable using the `siteMetadata.siteUrl` property in
  // its `gatsby-config.js`.
  globalThis.window.__BASE_PATH__ = 'https://example.com'
})

test('does not merge if no preview data is available', async (t) => {
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

// test('merges data only where `_previewable` field matches', async () => {
//   const pluginOptions = createPluginOptions()
//   const Provider = createPrismicContext({ pluginOptions })
//   const config = createConfig()

//   const token = createPreviewToken(pluginOptions.repositoryName)
//   cookie.set(prismic.cookie.preview, token)

//   const queryResults = [
//     createPrismicAPIDocument(),
//     createPrismicAPIDocument(),
//     createPrismicAPIDocument(),
//     createPrismicAPIDocument(),
//   ]
//   const queryResultsNodes = queryResults.map(
//     (doc) =>
//       nodeHelpers.createNodeFactory(doc.type)(
//         doc,
//       ) as PrismicAPIDocumentNodeInput,
//   )

//   nock(new URL(pluginOptions.apiEndpoint).origin)
//     .get('/api/v2/documents/search')
//     .query({
//       ref: token,
//       access_token: pluginOptions.accessToken,
//       lang: pluginOptions.lang,
//       graphQuery: pluginOptions.graphQuery,
//       page: 1,
//       pageSize: 100,
//     })
//     .reply(200, {
//       total_pages: 1,
//       results: queryResults,
//     })

//   nock(window.__BASE_PATH__)
//     .get('/static/9e387d94c04ebf0e369948edd9c66d2b.json')
//     .reply(
//       200,
//       JSON.stringify({
//         type: gatsbyPrismic.PrismicSpecialType.Document,
//         'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
//       }),
//     )

//   // Need to use the query results nodes rather than new documents to ensure
//   // the IDs match.
//   const staticData = {
//     previewable: { ...queryResultsNodes[0] },
//     nonPreviewable: { ...queryResultsNodes[1] },
//   }
//   staticData.previewable._previewable = queryResultsNodes[0].prismicId
//   // Marking this data as "old" and should be replaced during the merge.
//   staticData.previewable.uid = 'old'

//   const { result, waitForValueToChange } = renderHook(
//     () => {
//       const context = usePrismicPreviewContext(pluginOptions.repositoryName)
//       const bootstrap = usePrismicPreviewBootstrap(
//         pluginOptions.repositoryName,
//         config,
//       )

//       const mergedData = useMergePrismicPreviewData(
//         pluginOptions.repositoryName,
//         staticData,
//       )

//       return { bootstrap, context, mergedData }
//     },
//     { wrapper: Provider },
//   )
//   const bootstrapPreview = result.current.bootstrap[1]

//   act(() => {
//     bootstrapPreview()
//   })

//   await waitForValueToChange(() => result.current.bootstrap[0].state)
//   expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPING')

//   await waitForValueToChange(() => result.current.bootstrap[0].state)
//   expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPED')

//   expect(result.current.mergedData.isPreview).toBe(true)
//   expect(result.current.mergedData.data.previewable.uid).toEqual(
//     queryResultsNodes[0].uid,
//   )
// })

// // test('recursively merges data', () => {})

// // test('allows skipping', () => {})
