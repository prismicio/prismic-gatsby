import React from 'react'
import { renderHook } from 'react-hooks-testing-library'
import Prismic from 'prismic-javascript'

import { mergePrismicPreviewData, usePrismicPreview } from '../hooks'
import { PreviewProvider } from '../components/PreviewProvider'

jest.mock('prismic-javascript')
beforeEach(() => (console.error = jest.fn()))
afterEach(() => console.error.mockClear())

const renderHookWithProvider = (callback, pluginOverrides) =>
  renderHook(callback, {
    wrapper: props => (
      <PreviewProvider
        pluginOptions={{
          accessToken: 'token',
          repositoryName: 'repository',
          linkResolver: doc => doc.uid,
          htmlSerializer: () => {},
          fetchLinks: [],
          ...pluginOverrides,
        }}
        typePaths={[
          {
            path: ['page', 'data', 'title'],
            type: 'PrismicStructuredTextType',
          },
          {
            path: ['page', 'data', 'body'],
            type: '[PrismicPageDataBodySlicesType]',
          },
          {
            path: ['page', 'data', 'body', 'description'],
            type: 'PrismicPageBodyDescription',
          },
          {
            path: ['page', 'data', 'body', 'description', 'primary'],
            type: 'PrismicPageBodyDescriptionPrimaryType',
          },
          {
            path: ['page', 'data', 'body', 'description', 'primary', 'heading'],
            type: 'PrismicStructuredTextType',
          },
          {
            path: ['page', 'data', 'body', 'description', 'primary', 'text'],
            type: 'PrismicStructuredTextType',
          },
        ]}
        {...props}
      />
    ),
  })

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
    const { result } = renderHookWithProvider(() =>
      usePrismicPreview(undefined),
    )

    expect(result.error.message).toMatch(/invalid location object!/i)
  })

  test('returns normalized preview data from Prismic', async () => {
    const api = {
      getByID: async () => ({
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
      }),
    }
    Prismic.getApi.mockResolvedValue(api)

    const { result, waitForNextUpdate } = renderHookWithProvider(() =>
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
    })
  })
})
