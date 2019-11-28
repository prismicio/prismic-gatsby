import { createRemoteFileNode } from 'gatsby-source-filesystem'

import {
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
} from '../../node/normalizers'

const createNodeIdReturnValue = 'result of createNodeId'
const createNodeId = jest.fn().mockReturnValue(createNodeIdReturnValue)

const context = {
  doc: { id: 'id' },
  createNodeId,
  gatsbyContext: {
    actions: { touchNode: () => {} },
    cache: { get: jest.fn(), set: () => {} },
    reporter: { error: (_, error) => console.error(error), warn: () => {} },
  },
  pluginOptions: {
    linkResolver: () => () => {},
    htmlSerializer: () => () => {},
    shouldDownloadImage: () => false,
  },
}

describe('normalizeImageField', () => {
  const value = {
    url: 'url',
    dimensions: 'dimensions',
    alt: 'alt',
    copyright: 'copyright',
  }

  const contextWithDownloadedImages = {
    ...context,
    pluginOptions: {
      ...context.pluginOptions,
      shouldDownloadImage: () => true,
    },
  }

  test('returns localFile field alongside base fields if shouldDownloadImage is true', async () => {
    const result = await normalizeImageField(
      undefined,
      value,
      undefined,
      contextWithDownloadedImages,
    )

    expect(result).toEqual({
      ...value,
      localFile: 'remoteFileNodeId',
    })
  })

  test('localFile field uses cached node ID if available and shouldDownloadImage is true', async () => {
    context.gatsbyContext.cache.get.mockReturnValueOnce({
      fileNodeID: 'cachedId',
    })

    const result = await normalizeImageField(
      undefined,
      value,
      undefined,
      contextWithDownloadedImages,
    )

    expect(result.localFile).toBe('cachedId')
  })

  test('localFile field is empty if file node could not be created and shouldDownloadImage is true', async () => {
    createRemoteFileNode.mockImplementationOnce(async () => {
      throw new Error()
    })

    const result = await normalizeImageField(undefined, value, undefined, {
      ...contextWithDownloadedImages,
      gatsbyContext: {
        ...contextWithDownloadedImages.gatsbyContext,
        reporter: {
          ...contextWithDownloadedImages.gatsbyContext.reporter,
          error: () => {},
        },
      },
    })

    expect(result.localFile).toBeUndefined()
  })

  test('localFile field is empty if shouldDownloadImage returns false', async () => {
    const result = await normalizeImageField(undefined, value, undefined, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        shouldDownloadImage: () => false,
      },
    })

    expect(result.localFile).toBeUndefined()
  })

  // TODO: Remove shouldNormalizeImage in version 4
  test('deprecated shouldNormalizeImage can be used in place of shouldDownloadImage', async () => {
    const result = await normalizeImageField(undefined, value, undefined, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        shouldDownloadImage: undefined,
        shouldNormalizeImage: () => true,
      },
    })

    expect(result.localFile).toBe('remoteFileNodeId')
  })

  test('provides key, value, node values to linkResolver', async () => {
    const key = 'key'
    const node = context.doc
    const result = await normalizeImageField(key, value, undefined, {
      ...context,
      pluginOptions: {
        ...context.pluginOptions,
        shouldDownloadImage: ({
          key: scopedKey,
          value: scopedValue,
          node: scopedNode,
        }) => scopedKey === key && scopedValue === value && scopedNode === node,
      },
    })

    expect(result.localFile).toEqual('remoteFileNodeId')
  })
})

describe('normalizeLinkField', () => {
  test('returns url, document, and raw fields alongside base fields', async () => {
    const value = { link_type: 'Document', id: 'id' }
    const result = await normalizeLinkField(
      undefined,
      value,
      undefined,
      context,
    )

    expect(result).toEqual({
      ...value,
      url: undefined,
      document: createNodeIdReturnValue,
      raw: value,
    })
  })

  test('document field is node id of linked document if document link', async () => {
    const value = { link_type: 'Document', id: 'id' }
    const result = await normalizeLinkField(
      undefined,
      value,
      undefined,
      context,
    )

    expect(result.document).toEqual(createNodeIdReturnValue)
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
    })

    expect(result.url).toBe(
      `${key} ${JSON.stringify(value)} ${JSON.stringify(node)}`,
    )
  })
})

describe('normalizeSlicesField', () => {
  test('returns value as-is', async () => {
    const value = ['id1', 'id2']
    const result = await normalizeSlicesField(undefined, value)

    expect(result).toEqual(value)
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
