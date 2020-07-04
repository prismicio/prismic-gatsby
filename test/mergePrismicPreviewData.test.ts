import { mergePrismicPreviewData } from '../src/mergePrismicPreviewData'

const mockNode = {
  id: 'id',
  parent: '__SOURCE__',
  children: [],
  internal: {
    type: 'MockNode',
    contentDigest: 'contentDigest',
    owner: 'owner',
  },
}

const previewData = {
  prismicPage: {
    ...mockNode,
    id: 'previewId',
    prismicId: 'prismicId',
    name: 'preview',
    internal: {
      ...mockNode.internal,
      type: 'PrismicPage',
    },
  },
}

describe('mergePrismicPreviewData', () => {
  test('replaces static data with preview data', () => {
    // TODO: Remove deprecation warning in v4.0.0.
    const spy = jest.spyOn(console, 'warn')
    spy.mockImplementation(() => {})

    const staticData = { prismicPage: mockNode }
    const result = mergePrismicPreviewData({ staticData, previewData })

    expect(spy.mock.calls[0][0]).toMatch(/deprecated/)
    expect(result).toEqual(previewData)

    spy.mockReset()
  })

  test('replaces nested nodes with Prismic IDs matching preview data', () => {
    const staticData = {
      notPrismicPage: {
        ...mockNode,
        object: { prismicId: previewData.prismicPage.prismicId },
        array: [
          { prismicId: previewData.prismicPage.prismicId },
          { foo: 'bar' },
        ],
        foo: 'bar',
      },
    }
    const result = mergePrismicPreviewData({ staticData, previewData })

    expect(result).toEqual({
      notPrismicPage: {
        ...staticData.notPrismicPage,
        object: previewData.prismicPage,
        array: [previewData.prismicPage, staticData.notPrismicPage.array[1]],
      },
    })
  })

  test('returns static data if no preview data', () => {
    const staticData = { prismicPage: mockNode }
    const result = mergePrismicPreviewData({ staticData })

    expect(result).toBe(staticData)
  })

  test('returns preview data if no static data', () => {
    const result = mergePrismicPreviewData({ previewData })

    expect(result).toBe(previewData)
  })
})
