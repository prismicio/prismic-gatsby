import Prismic from 'prismic-javascript'

import { documentToNodes } from '../documentToNodes'

const cacheById = async (id, context) => {
  const { nodeStore, pluginOptions } = context
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  if (nodeStore.has(id)) return

  // Create a key in our cache to prevent infinite recursion.
  nodeStore.set(id, {})

  // Query Prismic's API for the actual document node and normalize it.
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const api = await Prismic.api(apiEndpoint, { accessToken })
  const node = await api.getByID(value.id, { fetchLinks })
  const normalizedNodes = await documentToNodes(node, context)

  // Add the normalized nodes to the cache.
  normalizedNodes.forEach(x => nodeStore.set(x.id, x))
}

export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, nodeStore, createNodeId, linkResolver } = context

  const linkResolverForField = linkResolver({ key: id, value, node: doc })
  const linkedDocId = createNodeId(`${value.type} ${value.id}`)

  // Fetches, normalizes, and caches linked document if not present in cache.
  if (value.link_type === 'Document') await cacheById(linkedDocId, context)

  const proxyHandler = {
    get: (obj, prop) => {
      if (value.link_type === 'Document' && prop === 'document')
        return nodeStore.get(linkedDocId)

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
