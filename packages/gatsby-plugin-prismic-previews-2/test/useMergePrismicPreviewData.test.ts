import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import * as cookie from 'es-cookie'
import Prismic from 'prismic-javascript'
import md5 from 'tiny-hashes/md5'

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
} from '../src'

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

beforeEach(() => {
  clearAllCookies()
})

test('does not merge if no preview data is available', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const staticData = createStaticData()

  const { result } = renderHook(
    () => useMergePrismicPreviewData(pluginOptions.repositoryName, staticData),
    { wrapper: Provider },
  )

  expect(result.current.isPreview).toBe(false)
  expect(result.current.data).toEqual(staticData)
})

test('merges data only where `_previewable` field matches', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()
  const spy = jest.spyOn(Prismic, 'client')

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

  // @ts-expect-error - Partial client provided
  spy.mockReturnValue({
    query: jest.fn().mockImplementation((_, options) =>
      options.page === 1
        ? Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(0, 2),
          })
        : Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(2),
          }),
    ),
  })

  // Need to use the query results nodes rather than new documents to ensure
  // the IDs match.
  const staticData = {
    previewable: { ...queryResultsNodes[0] },
    nonPreviewable: { ...queryResultsNodes[1] },
  }
  staticData.previewable._previewable = queryResultsNodes[0].prismicId
  // Marking this data as "old" and should be replaced during the merge.
  staticData.previewable.uid = 'old'

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(Prismic.previewCookie, token)

  const { result, waitForNextUpdate } = renderHook(
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
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current.bootstrap[1]

  act(() => {
    bootstrapPreview()
  })

  await waitForNextUpdate()

  expect(result.current.mergedData.isPreview).toBe(true)
  expect(result.current.mergedData.data.previewable.uid).toEqual(
    queryResultsNodes[0].uid,
  )
})

// test('recursively merges data', () => {})

// test('allows skipping', () => {})
