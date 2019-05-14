import PrismicDOM from 'prismic-dom'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

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
    console.error(error)
  }

  return {
    ...value,
    localFile: fileNode ? fileNode.id : null,
  }
}

export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, gatsbyContext, pluginOptions } = context
  const { createNodeId } = gatsbyContext
  const { linkResolver } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })

  return {
    ...value,
    url: PrismicDOM.Link.url(value, linkResolverForField),
    document: createNodeId(`${value.type} ${value.id}`),
  }
}

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
