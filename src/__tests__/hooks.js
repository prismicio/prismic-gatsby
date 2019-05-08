import { renderHook } from 'react-hooks-testing-library'
import Prismic from 'prismic-javascript'

import { mergePrismicPreviewData, usePrismicPreview } from '../hooks'

jest.mock('prismic-javascript')
beforeEach(() => (console.error = jest.fn()))
afterEach(() => console.error.mockClear())

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
  test('throws error if location is falsey', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({
        location: undefined,
        accessToken: 'token',
        repositoryName: 'repo-name',
        linkResolver: doc => doc.uid,
      }),
    )

    expect(result.error.message).toMatch(/invalid hook parameters!/i)
  })

  test('throws error if accessToken is falsey', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({
        location: {},
        accessToken: undefined,
        repositoryName: 'repo-name',
        linkResolver: doc => doc.uid,
      }),
    )

    expect(result.error.message).toMatch(/invalid hook parameters!/i)
  })

  test('throws error if repositoryName is falsey', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({
        location: {},
        accessToken: 'token',
        repositoryName: undefined,
        linkResolver: doc => doc.uid,
      }),
    )

    expect(result.error.message).toMatch(/invalid hook parameters!/i)
  })

  test('throws error if linkResolver is not a function', () => {
    const { result } = renderHook(() =>
      usePrismicPreview({
        location: {},
        accessToken: 'token',
        repositoryName: 'repo',
        linkResolver: 'hello world',
      }),
    )

    expect(result.error.message).toMatch(/invalid hook parameters!/i)
  })

  test('returns normalized preview data from Prismic', async () => {
    const api = {
      getByID: async () => ({
        id: 'XFyxoxAAACQAIqnY',
        uid: 'test',
        type: 'page',
        data: {
          title: [{ type: 'heading1', text: 'Test', spans: [] }],
        },
        body: [
          {
            slice_type: 'description',
            slice_label: null,
            items: [{}],
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
      }),
    }
    Prismic.getApi.mockResolvedValue(api)

    const { result, waitForNextUpdate } = renderHook(() =>
      usePrismicPreview({
        location: {
          search:
            'http://localhost:8000/preview?token=https%3A%2F%2Ftest.prismic.io%2Fpreviews%2FXNIWYywAADkA7fH_&documentId=XFyi2hAAACIAImfA',
        },
        accessToken: 'token',
        repositoryName: 'repo',
        linkResolver: () => '/',
      }),
    )

    await waitForNextUpdate()

    expect(result.current.previewData).toMatchObject({
      prismicPage: {
        uid: 'test',
        type: 'page',
        data: {
          title: {
            html: '<h1>Test</h1>',
            text: 'Test',
            raw: [{ type: 'heading1', text: 'Test', spans: [] }],
          },
        },
        body: [
          {
            slice_type: 'description',
            slice_label: null,
            items: [{}],
            primary: {
              heading: [{ type: 'heading1', text: 'Heading', spans: [] }],
              text: [{ type: 'paragraph', text: 'Copy Text.', spans: [] }],
            },
          },
        ],
        prismicId: 'XFyxoxAAACQAIqnY',
        id: 'Prismic__Page__XFyxoxAAACQAIqnY',
        parent: '__SOURCE__',
        children: [],
        internal: {
          type: 'PrismicPage',
          contentDigest: '4a506118c38b6adf9e5ec8dd9748479e',
        },
      },
    })
  })
})
