import PrismicDOM from 'prismic-dom'

export const normalizeLinkField = async (id, value, _depth, context) => {
  const { doc, createNodeId, pluginOptions } = context
  const { linkResolver } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })

  return {
    ...value,
    url: PrismicDOM.Link.url(value, linkResolverForField),
    document: createNodeId(`${value.type} ${value.id}`),
    raw: value,
  }
}
