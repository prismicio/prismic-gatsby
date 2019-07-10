import { renderHook } from '@testing-library/react-hooks'
import Prismic from 'prismic-javascript'
import queryString from 'query-string'

import { GLOBAL_STORE_KEY } from '../../common/constants'
import {
  mergePrismicPreviewData,
  usePrismicPreview,
} from '../../browser/usePrismicPreview'

jest.mock('prismic-javascript')
beforeEach(() => (console.error = jest.fn()))
afterEach(() => console.error.mockClear())

const mockFetch = data =>
  jest.fn().mockImplementation(() => ({
    ok: true,
    json: () => data,
  }))

describe('mergePrismicPreviewData', () => {
  test('throws if staticData and previewData are falsey', () => {
    expect(() =>
      mergePrismicPreviewData({
        staticData: undefined,
        previewData: undefined,
      }),
    ).toThrow(/invalid data/i)
  })

  test('returns previewData if staticData is falsey', () => {
    expect(
      mergePrismicPreviewData({
        staticData: undefined,
        previewData: { test: 'DATA' },
      }),
    ).toMatchObject({ test: 'DATA' })
  })

  test('returns staticData if previewData is falsey', () => {
    expect(
      mergePrismicPreviewData({
        staticData: { test: 'DATA' },
        previewData: undefined,
      }),
    ).toMatchObject({ test: 'DATA' })
  })

  test('returns merged object given static and preview data with same custom type', () => {
    const staticData = {
      prismicPage: {
        foo: 'bar',
        hello: 'world',
        repeatable: ['1', '2'],
      },
      allPrismicPage: {
        foo: 'bar',
      },
    }

    const previewData = {
      prismicPage: {
        foo: 'bar',
        hello: 'CHANGED_VALUE',
        repeatable: ['2', '3', '4', '5'],
      },
    }

    expect(
      mergePrismicPreviewData({
        staticData,
        previewData,
      }),
    ).toMatchObject({
      prismicPage: {
        foo: 'bar',
        hello: 'CHANGED_VALUE',
        repeatable: ['2', '3', '4', '5'],
      },
      allPrismicPage: {
        foo: 'bar',
      },
    })
  })

  test('returns merged object via traversely replacing static nodes with preview nodes with the same ID', () => {
    const staticData = {
      prismicPage: {
        body: [
          {
            items: [
              {
                team_member: {
                  document: [
                    {
                      id: 'testId',
                      data: {
                        name: 'Static Name',
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      allPrismicPage: {
        foo: 'bar',
      },
    }

    const previewData = {
      prismicTeamMember: {
        id: 'testId',
        data: {
          name: 'CHANGED_NAME',
        },
      },
    }

    expect(
      mergePrismicPreviewData({
        staticData,
        previewData,
      }),
    ).toMatchObject({
      prismicPage: {
        body: [
          {
            items: [
              {
                team_member: {
                  document: [
                    {
                      id: 'testId',
                      data: {
                        name: 'CHANGED_NAME',
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      allPrismicPage: {
        foo: 'bar',
      },
    })
  })
})

describe('usePrismicPreview', () => {
  const location = {
    search: queryString.stringify({
      token: 'https://test.prismic.io/previews/XNIWYywAADkA7fH_',
      documentId: 'id',
    }),
  }

  const typePaths = [
    {
      path: ['page', 'data', 'title'],
      type: 'PrismicStructuredTextType',
    },
    {
      path: ['page', 'data', 'body'],
      type: 'Slices',
    },
    {
      path: ['page', 'data', 'body', 'description', 'primary', 'heading'],
      type: 'PrismicStructuredTextType',
    },
    {
      path: ['page', 'data', 'body', 'description', 'primary', 'text'],
      type: 'PrismicStructuredTextType',
    },
  ]

  const rawPreviewData = {
    id: 'id',
    uid: 'uid',
    type: 'page',
    data: {
      title: [{ type: 'heading1', text: 'Test', spans: [] }],
      body: [
        {
          slice_type: 'description',
          slice_label: null,
          items: [],
          primary: {
            heading: [{ type: 'heading1', text: 'Heading', spans: [] }],
            text: [
              {
                type: 'paragraph',
                text: 'Copy Text.',
                spans: [],
              },
            ],
          },
        },
      ],
    },
  }

  const normalizedPreviewData = {
    prismicPage: {
      uid: 'uid',
      type: 'page',
      data: {
        title: {
          html: '<h1>Test</h1>',
          text: 'Test',
          raw: [{ type: 'heading1', text: 'Test', spans: [] }],
        },
        body: [
          {
            slice_type: 'description',
            slice_label: null,
            items: [],
            primary: {
              heading: {
                text: 'Heading',
                html: '<h1>Heading</h1>',
                raw: [{ type: 'heading1', text: 'Heading', spans: [] }],
              },
              text: {
                text: 'Copy Text.',
                html: '<p>Copy Text.</p>',
                raw: [{ type: 'paragraph', text: 'Copy Text.', spans: [] }],
              },
            },
          },
        ],
      },
      prismicId: 'id',
      id: 'ad9a3286-7f27-5fa8-8ac1-da80c451652e',
      internal: {
        type: 'PrismicPage',
        contentDigest: 'fc85796edf46f0437861b2a7938f5df9',
      },
    },
  }

  const pluginOptions = {
    repositoryName: 'repositoryName',
    accessToken: 'accessToken',
    fetchLinks: [],
    schemas: {},
    schemasDigest: 'schemasDigest',
    typePathsFilenamePrefix: 'typePaths',
    htmlSerializer: () => {},
    linkResolver: () => () => '/',
    pathResolver: () => () => '/',
  }

  global.fetch = mockFetch(typePaths)
  global[GLOBAL_STORE_KEY] = {
    [pluginOptions.repositoryName]: pluginOptions,
    schemasDigest: pluginOptions.schemasDigest,
  }

  Prismic.getApi.mockResolvedValue({ getByID: async () => rawPreviewData })

  test('isPreview is false if location is falsey', () => {
    const { result } = renderHook(() => usePrismicPreview(undefined))

    expect(result.current.isPreview).toBe(false)
  })

  test('isPreview is false if location is invalid', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({ ...location, search: undefined }),
    )

    expect(result.current.isPreview).toBe(false)
  })

  test('throws error if repositoryName is not defined', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        repositoryName: undefined,
      }),
    )

    expect(result.error.message).toMatch(/invalid repository name/i)
  })

  test('throws error if accessToken is not defined', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        accessToken: undefined,
      }),
    )

    expect(result.error.message).toMatch(/invalid access token/i)
  })

  test('does not throw error if fetchLinks is not defined', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        fetchLinks: [],
      }),
    )

    expect(result.error).toBeUndefined()
  })

  test('throws error if linkResolver is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        linkResolver: 'linkResolver',
      }),
    )

    expect(result.error.message).toMatch(/linkResolver is not a function/i)
  })

  test('throws error if pathResolver is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        pathResolver: 'PATH RESOLVER',
      }),
    )

    expect(result.error.message).toMatch(/pathResolver is not a function/i)
  })

  test('throws error if htmlSerializer is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        htmlSerializer: 'HTML SERIALIZER',
      }),
    )

    expect(result.error.message).toMatch(/htmlSerializer is not a function/i)
  })

  test('returns normalized preview data from Prismic', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, pluginOptions),
    )

    await waitForNextUpdate()

    expect(result.current.previewData).toMatchObject(normalizedPreviewData)
  })

  test('returns a path derived from linkResolver if pathResolver is not defined', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        pathResolver: undefined,
        linkResolver: () => () => 'LINK',
      }),
    )

    await waitForNextUpdate()

    expect(result.current.path).toBe('LINK')
  })

  test('returns a path derived from pathResolver if it is defined', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, {
        ...pluginOptions,
        pathResolver: () => () => 'PATH RESOLVER',
      }),
    )

    await waitForNextUpdate()

    expect(result.current.path).toBe('PATH RESOLVER')
  })

  global.fetch.mockClear()
  Prismic.getApi.mockClear()
})
