export const STATIC_UID = 'static'
export const PREVIEW_UID = 'preview'

export const MOCK_PAGE_PROPS = {
  path: '/',
  location,
}

export const MOCK_NODE = {
  _previewable: 'id',
  id: 'id',
  parent: '__SOURCE__',
  children: [],
  internal: {
    type: 'MockNode',
    contentDigest: 'contentDigest',
    owner: 'owner',
  },
}

export const STATIC_DATA = {
  prismicPage: {
    ...MOCK_NODE,
    prismicId: 'prismicId',
    uid: STATIC_UID,
    type: 'page',
  },
  prismicOtherData: {
    ...MOCK_NODE,
    prismicId: 'otherPrismicId',
    uid: 'otherUID',
    type: 'otherData',
  },
}

export const PREVIEW_DATA = {
  prismicPage: {
    ...MOCK_NODE,
    prismicId: 'prismicId',
    uid: PREVIEW_UID,
    type: 'page',
  },
}
