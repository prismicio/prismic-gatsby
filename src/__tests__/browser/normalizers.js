import util from 'util'

import {
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
} from '../../browser/normalizers'

const createNodeIdReturnValue = 'result of createNodeId'
const createNodeId = jest.fn().mockReturnValue(createNodeIdReturnValue)

const createContentDigestReturnValue = 'result of createContentDigest'
const createContentDigest = jest
  .fn()
  .mockReturnValue(createContentDigestReturnValue)

const linkResolverReturnValue = 'result of linkResolver'
const linkResolver = jest.fn().mockReturnValue(() => linkResolverReturnValue)

const context = {
  doc: { id: 'id' },
  createNodeId,
  hasNodeById: () => {},
  gatsbyContext: { actions: {} },
  pluginOptions: { linkResolver, htmlSerializer: () => () => {} },
  createContentDigest,
}

describe('normalizeImageField', () => {
  test('returns localFile field alongside base fields with null value', async () => {
    const value = {
      url: 'url',
      dimensions: 'dimensions',
      alt: 'alt',
      copyright: 'copyright',
    }

    const result = await normalizeImageField(
      undefined,
      value,
      undefined,
      context,
    )

    expect(result).toEqual({
      ...value,
      localFile: null,
    })
  })
})

describe('normalizeLinkField', () => {
  test('returns a proxy', async () => {
    const result = await normalizeLinkField(undefined, {}, undefined, context)

    expect(util.types.isProxy(result)).toBe(true)
  })

  test('returns url and raw fields alongside base fields', async () => {
    const value = { link_type: 'Web', url: 'http://example.com' }

    const result = await normalizeLinkField(
      undefined,
      value,
      undefined,
      context,
    )

    expect(result).toEqual({
      ...value,
      document: null,
      raw: value,
    })
  })

  test('document field returns node from node store', async () => {
    const node = { id: createNodeIdReturnValue }
    const nodeStore = new Map([[node.id, node]])
    const hasNodeById = id => nodeStore.has(id)
    const getNodeById = id => nodeStore.get(id)

    const value = { link_type: 'Document', id: 'id' }

    const result = await normalizeLinkField(undefined, value, undefined, {
      ...context,
      hasNodeById,
      getNodeById,
    })

    expect(result.document).toEqual(node)
  })

  test('fetches and creates normalized node for document link if not in node store', async () => {
    const nodeStore = new Map()
    const createNode = node => nodeStore.set(node.id, node)
    const hasNodeById = id => nodeStore.has(id)
    const getNodeById = id => nodeStore.get(id)

    const value = { link_type: 'Document', id: 'id', type: 'custom_type' }

    const result = await normalizeLinkField(undefined, value, undefined, {
      ...context,
      createNode,
      hasNodeById,
      getNodeById,
    })

    expect(result.document).toEqual({
      id: createNodeIdReturnValue,
      prismicId: 'id',
      type: 'custom_type',
      url: linkResolverReturnValue,
      data: {},
      dataRaw: undefined,
      dataString: undefined,
      internal: {
        contentDigest: createContentDigestReturnValue,
        type: 'PrismicCustomType',
      },
    })
  })

  test('document field is null if not document link', async () => {
    const value = { link_type: 'Web', url: 'http://example.com' }
    const result = await normalizeLinkField(
      undefined,
      value,
      undefined,
      context,
    )

    expect(result.document).toBeNull()
  })

  test('provides key, value, node values to linkResolver', async () => {
    const key = 'key'
    const value = { link_type: 'Document', id: 'id' }
    const node = context.doc

    const result = await normalizeLinkField(key, value, node, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        linkResolver: ({ key, value, node }) => () =>
          `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
      },
      hasNodeById: () => true,
    })

    expect(result.url).toBe(
      `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
    )
  })
})

describe('normalizeSlicesField', () => {
  test('returns a proxy', async () => {
    const result = await normalizeSlicesField(
      undefined,
      ['id1', 'id2'],
      undefined,
      context,
    )

    expect(util.types.isProxy(result)).toBe(true)
  })

  test('proxy returns slice node with __typename if in node store', async () => {
    const baseSlice = { internal: { type: 'custom_type' } }
    const slice1 = { ...baseSlice, id: 'id1' }
    const slice2 = { ...baseSlice, id: 'id2' }
    const nodeStore = [slice1, slice2]
    const hasNodeById = id => nodeStore.some(node => node.id === id)
    const getNodeById = id => nodeStore.find(node => node.id === id)

    const result = await normalizeSlicesField(
      undefined,
      ['id1', 'id2'],
      undefined,
      { ...context, hasNodeById, getNodeById },
    )

    expect(result[0]).toEqual({ ...slice1, __typename: 'custom_type' })
    expect(result[1]).toEqual({ ...slice2, __typename: 'custom_type' })
  })

  test('proxy returns default value if not in node store', async () => {
    const result = await normalizeSlicesField(
      undefined,
      ['id1', 'id2'],
      undefined,
      { ...context, hasNodeById: () => false },
    )

    expect(result[0]).toEqual('id1')
    expect(result[1]).toEqual('id2')
    expect(result[2]).toEqual(undefined)
  })
})

describe('normalizeStructuredTextField', () => {
  test('returns html, text, and raw fields', async () => {
    const result = await normalizeStructuredTextField(
      undefined,
      [{ type: 'heading1', text: 'value', spans: [] }],
      undefined,
      context,
    )

    expect(result).toEqual({
      html: '<h1>value</h1>',
      text: 'value',
      raw: [{ type: 'heading1', text: 'value', spans: [] }],
    })
  })

  test('provides key, value, node values to linkResolver', async () => {
    const key = 'key'
    const value = [
      {
        type: 'paragraph',
        text: 'value',
        spans: [
          {
            start: 0,
            end: 18,
            type: 'hyperlink',
            data: { link_type: 'Document', id: 'linkedDocId' },
          },
        ],
      },
    ]
    const node = context.doc

    const result = await normalizeStructuredTextField(key, value, undefined, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        linkResolver: ({ key, value, node }) => () =>
          `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
      },
    })

    expect(result).toEqual({
      html: `<p><a  href="${key} ${JSON.stringify(value)} ${JSON.stringify(
        node,
      )}">value</a></p>`,
      text: 'value',
      raw: value,
    })
  })

  test('provides key, value, node values to htmlSerializer', async () => {
    const key = 'key'
    const value = [{ type: 'heading1', text: 'value', spans: [] }]
    const node = context.doc

    const result = await normalizeStructuredTextField(key, value, undefined, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        htmlSerializer: ({ key, value, node }) => () =>
          `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
      },
    })

    expect(result).toEqual({
      html: `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
      text: 'value',
      raw: value,
    })
  })
})
