import PrismicDOM from 'prismic-dom'

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

const processRichTextField = (value, linkResolver, htmlSerializer) => ({
  html: PrismicDOM.RichText.asHtml(value, linkResolver, htmlSerializer),
  text: PrismicDOM.RichText.asText(value),
  raw: value,
})

const processLinkField = (value, linkResolver, generateNodeId) => {
  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id) return undefined
      return {
        document___NODE: [generateNodeId(value.type, value.id)],
        url: PrismicDOM.Link.url(value, linkResolver),
        raw: value,
      }

    case 'Media':
    case 'Web':
      return {
        url: value.url,
        raw: value,
      }

    default:
      return undefined
  }
}

export const processField = (key, value, node, pluginOptions, nodeHelpers) => {
  let { linkResolver = () => {}, htmlSerializer = () => {} } = pluginOptions
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return processRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return processLinkField(value, linkResolver, generateNodeId)

  return value
}
