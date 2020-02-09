import { mergePrismicPreviewData } from '../src/mergePrismicPreviewData'

const previewData = {
  prismicPage: {
    id: 'previewId',
    prismicId: 'prismicId',
    name: 'preview',
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'PrismicPage',
      contentDigest: 'contentDigest',
      owner: 'owner',
    },
  },
}

describe('mergePrismicPreviewData', () => {
  test('replaces static data with preview data', () => {
    const staticData = { prismicPage: { name: 'static' } }
    const result = mergePrismicPreviewData({ staticData, previewData })

    expect(result).toEqual(previewData)
  })

  test('replaces nested nodes with Prismic IDs matching preview data', () => {
    const staticData = {
      notPrismicPage: {
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
    const staticData = { staticData: 'static' }
    const result = mergePrismicPreviewData({ staticData })
    expect(result).toBe(staticData)
  })

  test('returns preview data if no static data', () => {
    const result = mergePrismicPreviewData({ previewData })
    expect(result).toBe(previewData)
  })
})
