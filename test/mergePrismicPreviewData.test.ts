import { mergePrismicPreviewData } from '../src/mergePrismicPreviewData'

const staticData = {
  prismicPage: {
    _previewable: 'prismicPagePrismicId',
    id: 'id',
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'PrismicPage',
      contentDigest: 'contentDigest',
      owner: 'owner',
    },
  },
  notPrismicPage: {
    _previewable: 'notPrismicPagePrismicId',
    object: { _previewable: 'prismicPagePrismicId' },
    array: [{ _previewable: 'prismicPagePrismicId' }, { foo: 'bar' }] as const,
    foo: 'bar',
    id: 'id',
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'PrismicPage',
      contentDigest: 'contentDigest',
      owner: 'owner',
    },
  },
}

const previewData = {
  prismicPage: {
    ...staticData.prismicPage,
    prismicId: 'prismicPagePrismicId',
    __previewDataIdentifier: 'previewData',
  },
}

const _makeLegacy = <T extends { _previewable: string }>(obj: T) => {
  const newObj = { ...obj, prismicId: obj._previewable }
  delete newObj._previewable
  return newObj
}

describe('mergePrismicPreviewData', () => {
  test('replaces static data with preview data', () => {
    const result = mergePrismicPreviewData({ staticData, previewData })

    expect(result).toEqual({
      prismicPage: previewData.prismicPage,
      notPrismicPage: {
        ...staticData.notPrismicPage,
        object: previewData.prismicPage,
        array: [previewData.prismicPage, staticData.notPrismicPage.array[1]],
      },
    })
  })

  // TODO: Remove in v4.0.0.
  test('supports older prismicId nested node replacement', () => {
    // TODO: Remove deprecation warning in v4.0.0.
    const spy = jest.spyOn(console, 'warn')
    spy.mockImplementation(() => {})

    const legacyStaticData = {
      ...staticData,
      prismicPage: _makeLegacy(staticData.prismicPage),
      notPrismicPage: {
        ...staticData.notPrismicPage,
        object: _makeLegacy(staticData.notPrismicPage.object),
        array: [
          _makeLegacy(staticData.notPrismicPage.array[0]),
          staticData.notPrismicPage.array[1],
        ],
      },
    }

    const result = mergePrismicPreviewData({
      staticData: legacyStaticData,
      previewData,
    })

    expect(spy.mock.calls[0][0]).toMatch(/deprecated/)
    expect(result).toEqual({
      prismicPage: previewData.prismicPage,
      notPrismicPage: {
        ...staticData.notPrismicPage,
        object: previewData.prismicPage,
        array: [previewData.prismicPage, staticData.notPrismicPage.array[1]],
      },
    })

    spy.mockReset()
  })

  test('returns static data if no preview data', () => {
    const result = mergePrismicPreviewData({ staticData })

    expect(result).toBe(staticData)
  })

  test('returns preview data if no static data', () => {
    const result = mergePrismicPreviewData({ previewData })

    expect(result).toBe(previewData)
  })
})
