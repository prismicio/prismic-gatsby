import { documentToNodes } from '../documentToNodes'

const gatsbyContext = {
  createNodeId: jest.fn().mockReturnValue('result of createNodeId'),
  createContentDigest: jest
    .fn()
    .mockReturnValue('result of createContentDigest'),
  actions: {},
  schema: {},
  store: {},
  cache: {},
}

const normalizedImageValue = { value: 'result of normalizeImageField' }
const normalizeImageField = jest.fn().mockReturnValue(normalizedImageValue)
const normalizeStructuredTextField = jest
  .fn()
  .mockReturnValue('result of normalizeStructuredTextField')
const normalizeLinkField = jest
  .fn()
  .mockReturnValue('result of normalizeLinkField')

const baseContext = {
  gatsbyContext,
  normalizeLinkField,
  normalizeImageField,
  normalizeStructuredTextField,
}

const baseDoc = { id: 'id', type: 'custom_type' }

describe('documentToNodes', () => {
  test('returns a list of normalized nodes', async () => {
    const result = await documentToNodes(baseDoc, baseContext)

    expect(Array.isArray(result)).toBe(true)
  })

  describe('PrismicDocument', () => {
    test('sets document id as prismicId', async () => {
      const result = await documentToNodes(baseDoc, baseContext)

      expect(result[0].id).toBe('result of createNodeId')
      expect(result[0].prismicId).toBe('id')
    })

    test('dataString is equal to data stringified pre-normalization', async () => {
      const data = { link: { type: 'custom_type' } }
      const result = await documentToNodes(
        { ...baseDoc, data },
        {
          ...baseContext,
          typePaths: [
            { path: ['custom_type', 'data'], type: 'PrismicCustomTypeData' },
            { path: ['custom_type', 'data', 'link'], type: 'PrismicLinkType' },
          ],
        },
      )

      expect(result[0].dataString).toEqual(JSON.stringify(data))
    })

    test('dataRaw is equal to data', async () => {
      const data = { link: { type: 'custom_type' } }
      const result = await documentToNodes(
        { ...baseDoc, data },
        {
          ...baseContext,
          typePaths: [
            { path: ['custom_type', 'data'], type: 'PrismicCustomTypeData' },
            { path: ['custom_type', 'data', 'link'], type: 'PrismicLinkType' },
          ],
        },
      )

      expect(result[0].dataRaw).toEqual(data)
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
      const result = await documentToNodes(
        { ...baseDoc, data: { image } },
        context,
      )

      expect(result[0].data.image).toEqual(normalizedImageValue)
    })

    test('normalizes image field thumbnail images', async () => {
      const result = await documentToNodes(
        { ...baseDoc, data: { image: { ...image, Thumb: image } } },
        context,
      )

      expect(result[0].data.image).toEqual({
        ...normalizedImageValue,
        Thumb: normalizedImageValue,
      })
    })
  })

  describe('PrismicStructuredTextType', () => {
    const normalizedStructuredTextValue =
      'result of normalizeStructuredTextField'
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'text'],
          type: 'PrismicStructuredTextType',
        },
      ],
      normalizeStructuredTextField: () => normalizedStructuredTextValue,
    }

    test('normalizes structured text fields', async () => {
      const result = await documentToNodes(
        { ...baseDoc, data: { text: { spans: [] } } },
        context,
      )

      expect(result[0].data.text).toEqual(normalizedStructuredTextValue)
    })
  })

  describe('PrismicLinkType', () => {
    const normalizedLinkValue = 'result of normalizeLinkField'
    const context = {
      ...baseContext,
      typePaths: [
        {
          path: ['custom_type', 'data', 'link'],
          type: 'PrismicLinkType',
        },
      ],
      normalizeLinkField: () => normalizedLinkValue,
    }

    test('normalizes link fields', async () => {
      const result = await documentToNodes(
        { ...baseDoc, data: { link: { type: 'custom_type' } } },
        context,
      )

      expect(result[0].data.link).toEqual(normalizedLinkValue)
    })
  })

  describe('GroupType', () => {
    const normalizedLinkValue = 'result of normalizeLinkField'
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
      normalizeLinkField: () => normalizedLinkValue,
    }

    test('normalizes group fields by normalzing each entry', async () => {
      const result = await documentToNodes(
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

      expect(result[0].data.group).toEqual([
        { link: 'result of normalizeLinkField' },
        { link: 'result of normalizeLinkField' },
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

    const normalizedLinkValue = 'result of normalizeLinkField'
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
      normalizeLinkField: () => normalizedLinkValue,
    }

    test('normalizes slices fields by normalizing to the entry node ID', async () => {
      const result = await documentToNodes(
        {
          ...baseDoc,
          data: { body: [primarySliceEntry] },
        },
        context,
      )

      expect(result[1].data.body).toEqual(['result of createNodeId'])
    })

    test('normalizes slices field entries with primary fields', async () => {
      const result = await documentToNodes(
        {
          ...baseDoc,
          data: { body: [primarySliceEntry] },
        },
        context,
      )

      expect(result[0]).toMatchObject({
        id: 'result of createNodeId',
        slice_type: 'link_with_primary',
        primary: { link: normalizedLinkValue },
      })
    })

    test('normalizes slices field entries with items fields', async () => {
      const result = await documentToNodes(
        {
          ...baseDoc,
          data: { body: [itemsSliceEntry] },
        },
        context,
      )

      expect(result[0]).toMatchObject({
        id: 'result of createNodeId',
        slice_type: 'link_with_items',
        items: [{ link: normalizedLinkValue }, { link: normalizedLinkValue }],
      })
    })
  })
})
