import * as R from 'ramda'
import { documentToNodes } from '../../common/documentToNodes'

let nodeStore = []
const createNode = node => nodeStore.push(node)

const createNodeIdReturnValue = 'result of createNodeId'
const createNodeId = jest.fn().mockReturnValue(createNodeIdReturnValue)

const createContentDigestReturnValue = 'result of createContentDigest'
const createContentDigest = jest
  .fn()
  .mockReturnValue(createContentDigestReturnValue)

const normalizeImageFieldReturnValue = {
  value: 'result of normalizeImageField',
  thumbnails: null,
}
const normalizeImageField = jest
  .fn()
  .mockReturnValue(normalizeImageFieldReturnValue)

const normalizeStructuredTextFieldReturnValue =
  'result of normalizeStructuredTextField'
const normalizeStructuredTextField = jest
  .fn()
  .mockReturnValue(normalizeStructuredTextFieldReturnValue)

const normalizeLinkFieldReturnValue = 'result of normalizeLinkField'
const normalizeLinkField = jest
  .fn()
  .mockReturnValue(normalizeLinkFieldReturnValue)

const normalizeSlicesFieldReturnValue = 'result of normalizeSlicesField'
const normalizeSlicesField = jest
  .fn()
  .mockReturnValue(normalizeSlicesFieldReturnValue)

const linkResolverReturnValue = 'result of linkResolver'
const linkResolver = jest.fn().mockReturnValue(() => linkResolverReturnValue)

const baseContext = {
  pluginOptions: { linkResolver },
  createNode,
  createNodeId,
  createContentDigest,
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
}

const baseDoc = { id: 'id', type: 'custom_type' }

beforeEach(() => {
  nodeStore = []
})

describe('documentToNodes', () => {
  test('creates normalized nodes for a given document', async () => {
    await documentToNodes(baseDoc, baseContext)

    expect(nodeStore).toHaveLength(1)
  })

  describe('PrismicDocument', () => {
    test('sets prismicId as document id', async () => {
      await documentToNodes(baseDoc, baseContext)

      expect(nodeStore[0].id).toBe(createNodeIdReturnValue)
      expect(nodeStore[0].prismicId).toBe('id')
    })

    test('sets dataString to data stringified pre-normalization', async () => {
      const data = { link: { type: 'custom_type' } }

      await documentToNodes(
        { ...baseDoc, data },
        {
          ...baseContext,
          typePaths: [
            { path: ['custom_type', 'data'], type: 'PrismicCustomTypeData' },
            { path: ['custom_type', 'data', 'link'], type: 'PrismicLinkType' },
          ],
        },
      )

      expect(nodeStore[0].dataString).toEqual(JSON.stringify(data))
    })

    test('sets dataRaw to data pre-normalization', async () => {
      const data = { link: { type: 'custom_type' } }

      await documentToNodes(
        { ...baseDoc, data },
        {
          ...baseContext,
          typePaths: [
            { path: ['custom_type', 'data'], type: 'PrismicCustomTypeData' },
            { path: ['custom_type', 'data', 'link'], type: 'PrismicLinkType' },
          ],
        },
      )

      expect(nodeStore[0].dataRaw).toEqual(data)
    })

    test("sets url to document's URL using linkResolver", async () => {
      await documentToNodes(baseDoc, baseContext)

      expect(nodeStore[0].url).toEqual(linkResolverReturnValue)
    })
  })

  describe('PrismicImageType', () => {
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'image'],
          type: 'PrismicImageType',
        },
      ],
    }
    const image = {
      url: 'url',
      dimensions: 'dimensions',
      alt: 'alt',
      copyright: 'copyright',
    }

    test('normalizes image fields', async () => {
      await documentToNodes({ ...baseDoc, data: { image } }, context)

      expect(nodeStore[0].data.image).toEqual(normalizeImageFieldReturnValue)
    })

    test('normalizes image field thumbnail images', async () => {
      await documentToNodes(
        { ...baseDoc, data: { image: { ...image, thumb: image } } },
        context,
      )

      expect(nodeStore[0].data.image).toEqual({
        ...normalizeImageFieldReturnValue,
        thumbnails: {
          thumb: normalizeImageFieldReturnValue,
        },
      })
    })
  })

  describe('PrismicStructuredTextType', () => {
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'text'],
          type: 'PrismicStructuredTextType',
        },
      ],
    }

    test('normalizes structured text fields', async () => {
      await documentToNodes(
        { ...baseDoc, data: { text: { spans: [] } } },
        context,
      )

      expect(nodeStore[0].data.text).toEqual(
        normalizeStructuredTextFieldReturnValue,
      )
    })
  })

  describe('PrismicLinkType', () => {
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'link'],
          type: 'PrismicLinkType',
        },
      ],
    }

    test('normalizes link fields', async () => {
      await documentToNodes(
        { ...baseDoc, data: { link: { type: 'custom_type' } } },
        context,
      )

      expect(nodeStore[0].data.link).toEqual(normalizeLinkFieldReturnValue)
    })
  })

  describe('GroupType', () => {
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'group'],
          type: '[PrismicCustomTypeGroupGroupType]',
        },
        {
          path: ['custom_type', 'data', 'group', 'link'],
          type: 'PrismicLinkType',
        },
      ],
    }

    test('normalizes group fields by normalzing each entry', async () => {
      await documentToNodes(
        {
          ...baseDoc,
          data: {
            group: [
              { link: { type: 'custom_type' } },
              { link: { type: 'custom_type' } },
            ],
          },
        },
        context,
      )

      expect(nodeStore[0].data.group).toEqual([
        { link: normalizeLinkFieldReturnValue },
        { link: normalizeLinkFieldReturnValue },
      ])
    })
  })

  describe('SlicesType', () => {
    const linkField = { link: { type: 'custom_type' } }

    const primarySliceEntry = {
      slice_type: 'link_with_primary',
      primary: linkField,
    }

    const itemsSliceEntry = {
      slice_type: 'link_with_items',
      items: [linkField, linkField],
    }

    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'body'],
          type: '[PrismicCustomTypeBodySlicesType]',
        },
        {
          path: ['custom_type', 'data', 'body', 'link_with_primary', 'primary'],
          type: 'PrismicCustomTypeBodyLinkWithPrimaryPrimaryType',
        },
        {
          path: [
            'custom_type',
            'data',
            'body',
            'link_with_primary',
            'primary',
            'link',
          ],
          type: 'PrismicLinkType',
        },
        {
          path: ['custom_type', 'data', 'body', 'link_with_items', 'items'],
          type: '[PrismicCustomTypeBodyLinkWithItemsItemType]',
        },
        {
          path: [
            'custom_type',
            'data',
            'body',
            'link_with_items',
            'items',
            'link',
          ],
          type: 'PrismicLinkType',
        },
      ],
    }

    test('normalizes slices fields', async () => {
      await documentToNodes(
        {
          ...baseDoc,
          data: { body: [primarySliceEntry] },
        },
        context,
      )

      expect(nodeStore[1].data.body).toEqual(normalizeSlicesFieldReturnValue)
    })

    test('creates nodes for each slice entry', async () => {
      await documentToNodes(
        {
          ...baseDoc,
          data: { body: [primarySliceEntry, itemsSliceEntry] },
        },
        context,
      )

      const isSliceField = R.compose(
        R.startsWith('PrismicCustomTypeBody'),
        R.path(['internal', 'type']),
      )

      const sliceNodes = R.filter(isSliceField, nodeStore)

      expect(sliceNodes).toHaveLength(2)
    })

    test('normalizes slices field entries with primary fields', async () => {
      await documentToNodes(
        {
          ...baseDoc,
          data: { body: [primarySliceEntry] },
        },
        context,
      )

      expect(nodeStore[0]).toMatchObject({
        id: createNodeIdReturnValue,
        slice_type: 'link_with_primary',
        primary: { link: normalizeLinkFieldReturnValue },
      })
    })

    test('normalizes slices field entries with items fields', async () => {
      await documentToNodes(
        {
          ...baseDoc,
          data: { body: [itemsSliceEntry] },
        },
        context,
      )

      expect(nodeStore[0]).toMatchObject({
        id: createNodeIdReturnValue,
        slice_type: 'link_with_items',
        items: [
          { link: normalizeLinkFieldReturnValue },
          { link: normalizeLinkFieldReturnValue },
        ],
      })
    })
  })
})
