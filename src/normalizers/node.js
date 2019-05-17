import PrismicDOM from 'prismic-dom'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

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

// Normalizes a PrismicLinkType field by providing a resolved URL using
// `prismic-dom` on the `url` field. If the value is a document link, the
// document's data is provided on the `document` key.
//
// NOTE: The document field is set to a node ID but this will be resolved to
// the node in the GraphQL resolver.
export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, createNodeId, pluginOptions } = context
  const { linkResolver } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })

  let documentId = null
  if (value.link_type === 'Document')
    documentId = createNodeId(`${value.type} ${value.id}`)

  return {
    ...value,
    url: PrismicDOM.Link.url(value, linkResolverForField),
    document: documentId,
    raw: value,
  }
}

// Normalizes a PrismicImageType field by creating a File node using
// `gatsby-source-filesystem`. This allows for `gatsby-transformer-sharp` and
// `gatsby-image` integration. The linked node data is provided on the
// `localFile` key.
//
// NOTE: The document field is set to a node ID but this will be resolved to
// the node in the GraphQL resolver.
export const normalizeImageField = async (_id, value, _depth, context) => {
  const { docNodeId, gatsbyContext } = context
  const { createNodeId, store, cache, actions } = gatsbyContext
  const { createNode } = actions

  let fileNode

  try {
    fileNode = await createRemoteFileNode({
      url: value.url,
      parentNodeId: docNodeId,
      store,
      cache,
      createNode,
      createNodeId,
    })
  } catch (error) {
    // Ignore
  }

  return {
    ...value,
    localFile: fileNode ? fileNode.id : null,
  }
}

// Normalizes a SlicesType field by returning the value as-is.
export const normalizeSlicesField = (_id, value) => value
