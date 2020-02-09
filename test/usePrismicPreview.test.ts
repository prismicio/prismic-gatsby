import { renderHook } from '@testing-library/react-hooks'

import { onClientEntry } from '../src/gatsby-browser'
import { usePrismicPreview } from '../src/usePrismicPreview'

import mockSchema from './__fixtures__/schema.json'
import mockTypePaths from './__fixtures__/typePaths.json'

const createMockFetch = (map: { [url: string]: any }) =>
  jest.fn().mockImplementation((url: string) => {
    const response = map[url]

    if (response) return { ok: true, json: () => response }

    throw new Error(
      '404 - Mocked fetch does not have a response for the requested URL.',
    )
  })

window.fetch = createMockFetch({
  '/prismic-typepaths---0d5871ff6ad802968216a91db927d1b7.json': mockTypePaths,
})

const mockGatsbyContext = {
  getResourcesForPathnameSync: jest.fn(),
  getResourcesForPathname: jest.fn(),
  getResourceURLsForPathname: jest.fn(),
}

const pluginOptions = {
  repositoryName: 'repoName',
  plugins: [],
  schemas: { page: mockSchema },
}

describe('usePrismicPreview', () => {
  beforeAll(() => {
    window.history.pushState(
      {},
      '',
      '/preview?token=token&documentId=documentId',
    )

    onClientEntry!(mockGatsbyContext, pluginOptions)
  })

  beforeEach(() => {
    jest.clearAllMocks()

    window.history.pushState(
      {},
      '',
      '/preview?token=token&documentId=documentId',
    )
  })

  test('updates return state while fetching preview', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview({ repositoryName: pluginOptions.repositoryName }),
    )

    expect(result.current).toMatchObject({ isLoading: true, isPreview: true })
    await waitForNextUpdate()
    expect(result.current).toMatchObject({ isLoading: false, isPreview: true })
    expect(result.current.previewData).toMatchSnapshot()
  })

  test('updates state if not preview', async () => {
    window.history.pushState({}, '', '/preview')

    const { result } = renderHook(() =>
      usePrismicPreview({ repositoryName: pluginOptions.repositoryName }),
    )

    expect(result.current).toMatchObject({ isLoading: false, isPreview: false })
  })

  test('throws if unknown repository', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({ repositoryName: 'unknown' }),
    )

    expect(result.error.message).toMatch(/could not find/i)
  })
})
