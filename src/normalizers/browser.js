import Prismic from 'prismic-javascript'

import { documentToNodes } from '../documentToNodes'

export { normalizeStructuredTextField } from './node'

const fetchAndCreateDocumentNodes = async (id, context) => {
  const { hasNodeById, pluginOptions } = context
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  if (hasNodeById(id)) return

  // Create a key in our cache to prevent infinite recursion.
  nodeStore.set(id, {})

  // Query Prismic's API for the actual document node.
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const api = await Prismic.api(apiEndpoint, { accessToken })
  const doc = await api.getByID(value.id, { fetchLinks })

  // Normalize the document.
  await documentToNodes(doc, context)
}

export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, getNodeById, createNodeId, linkResolver } = context

  const linkResolverForField = linkResolver({ key: id, value, node: doc })
  const linkedDocId = createNodeId(`${value.type} ${value.id}`)

  // Fetches, normalizes, and caches linked document if not present in cache.
  if (value.link_type === 'Document')
    await fetchAndCreateDocumentNodes(linkedDocId, context)

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
      if (hasNodeById(obj[prop])) return getNodeById(obj[prop])

      return obj[prop]
    },
  })
}

export const normalizeImageField = async (_id, value) => ({
  ...value,
  localFile: null,
})
