import { renderHook } from 'react-hooks-testing-library'
import Prismic from 'prismic-javascript'

import { mergePrismicPreviewData, usePrismicPreview } from '../hooks'

jest.mock('prismic-javascript')
beforeEach(() => (console.error = jest.fn()))
afterEach(() => console.error.mockClear())

const mockFetch = data =>
  jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => data,
    }),
  )

describe('mergePrismicPreviewData', () => {
  test('returns undefined if staticData is falsey', () => {
    expect(
      mergePrismicPreviewData({ staticData: undefined, previewData: {} }),
    ).toBeUndefined()
  })

  test('returns staticData if previewData is falsey', () => {
    expect(
      mergePrismicPreviewData({ staticData: {}, previewData: undefined }),
    ).toMatchObject({})
  })

  test('returns merged object given static and preview data with same custom type', () => {
    const staticData = {
      prismicPage: {
        foo: 'bar',
        hello: 'world',
      },
      allPrismicPage: {
        foo: 'bar',
      },
    }

    const previewData = {
      prismicPage: {
        foo: 'bar',
        hello: 'CHANGED_VALUE',
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
    search:
      'http://localhost:8000/preview?token=https%3A%2F%2Ftest.prismic.io%2Fpreviews%2FXNIWYywAADkA7fH_&documentId=XFyi2hAAACIAImfA',
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
    id: 'XFyxoxAAACQAIqnY',
    uid: 'test',
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
      uid: 'test',
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
      prismicId: 'XFyxoxAAACQAIqnY',
      id: '969133b6-03e3-5b18-9152-f2a6e96796e8',
      internal: {
        type: 'PrismicPage',
        contentDigest: '3061931390fa8405bfb7b946d5e4105d',
      },
    },
  }

  const overrides = {
    linkResolver: () => () => '/',
    pathResolver: () => () => '/',
    htmlSerializer: () => {},
    repositoryName: 'Testing',
    token: 'token',
  }

  global.fetch = mockFetch(typePaths)

  const api = {
    getByID: async () => rawPreviewData,
  }
  Prismic.getApi.mockResolvedValue(api)

  test('throws error if location is falsey', () => {
    const { result } = renderHook(() => usePrismicPreview(undefined))

    expect(result.error.message).toMatch(/invalid location object!/i)
  })

  test('throws error if there is no defined linkResolver', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        htmlSerializer: () => {},
        linkResolver: undefined,
      }),
    )

    expect(result.error.message).toMatch(/invalid linkResolver/i)
  })

  test('throws error if linkResolver is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        htmlSerializer: () => {},
        linkResolver: 'linkResolver',
      }),
    )

    expect(result.error.message).toMatch(/invalid linkResolver/i)
  })

  test('throws error if pathResolver is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        htmlSerializer: () => {},
        linkResolver: () => {},
        pathResolver: 'pathResolver',
      }),
    )

    expect(result.error.message).toMatch(/pathResolver is not a function/i)
  })

  test('throws error if there is no defined htmlSerializer', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        htmlSerializer: undefined,
        linkResolver: () => {},
      }),
    )

    expect(result.error.message).toMatch(/invalid htmlSerializer/i)
  })

  test('throws error if htmlSerializer is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview(location, {
        htmlSerializer: 'HTMLSERIALIZER STRING',
        linkResolver: () => {},
      }),
    )

    expect(result.error.message).toMatch(/invalid htmlSerializer/i)
  })

  test('returns normalized preview data from Prismic', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, overrides),
    )

    await waitForNextUpdate()

    expect(result.current.previewData).toMatchObject(normalizedPreviewData)
  })

  test('returns a path derived from linkResolver if pathResolver is not defined', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, {
        ...overrides,
        pathResolver: undefined,
        linkResolver: () => 'LINK',
      }),
    )

    await waitForNextUpdate()

    expect(result.current.path).toBe('LINK')
  })

  test('returns a path derived from pathResolver if it is defined', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview(location, {
        ...overrides,
        pathResolver: () => 'PATH RESOLVER',
      }),
    )

    await waitForNextUpdate()

    expect(result.current.path).toBe('PATH RESOLVER')
  })

  global.fetch.mockClear()
  Prismic.getApi.mockClear()
})
