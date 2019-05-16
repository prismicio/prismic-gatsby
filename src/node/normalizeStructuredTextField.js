import PrismicDOM from 'prismic-dom'

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
