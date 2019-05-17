import Prismic from 'prismic-javascript'
import PrismicDOM from 'prismic-dom'

import { documentToNodes } from '../documentToNodes'

// Normalizes a PrismicStructuredTextType field by providing HTML and text
// versions of the value using `prismic-dom` on the `html` and `text` keys,
// respectively. The raw value is provided on the `raw` key.
export const normalizeStructuredTextField = async (
  id,
  value,
  _depth,
  context,
) => {
  const { doc, pluginOptions } = context
  const { linkResolver, htmlSerializer } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })
  const htmlSerializerForField = htmlSerializer({ key: id, value, node: doc })

  return {
    html: PrismicDOM.RichText.asHtml(
      value,
      linkResolverForField,
      htmlSerializerForField,
    ),
    text: PrismicDOM.RichText.asText(value),
    raw: value,
  }
}

const fetchAndCreateDocumentNodes = async (id, nodeId, context) => {
  const { createNode, hasNodeById, pluginOptions } = context
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  if (hasNodeById(nodeId)) return

  // Create a key in our cache to prevent infinite recursion.
  createNode({ id: nodeId })

  // Query Prismic's API for the actual document node.
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const api = await Prismic.api(apiEndpoint, { accessToken })
  const doc = await api.getByID(id, { fetchLinks })

  // Normalize the document.
  await documentToNodes(doc, context)
}

export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, getNodeById, createNodeId, pluginOptions } = context
  const { linkResolver } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })
  const linkedDocId = createNodeId(`${value.type} ${value.id}`)

  // Fetches, normalizes, and caches linked document if not present in cache.
  if (value.link_type === 'Document' && value.id)
    await fetchAndCreateDocumentNodes(value.id, linkedDocId, context)

  const proxyHandler = {
    get: (obj, prop) => {
      if (value.link_type === 'Document' && prop === 'document')
        return getNodeById(linkedDocId)

      return obj[prop]
    },
  }

  return new Proxy(
    {
      ...value,
      url: PrismicDOM.Link.url(value, linkResolverForField),
      raw: value,
    },
    proxyHandler,
  )
}

export const normalizeSlicesField = (_id, value, _depth, context) => {
  const { hasNodeById, getNodeById } = context

  return new Proxy(value, {
    get: (obj, prop) => {
      if (hasNodeById(obj[prop])) {
        const node = getNodeById(obj[prop])

        return {
          ...node,
          __typename: node.internal.type,
        }
      }

      return obj[prop]
    },
  })
}

export const normalizeImageField = async (_id, value) => ({
  ...value,
  localFile: null,
})
