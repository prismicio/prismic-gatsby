import PrismicDOM from 'prismic-dom'

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

export const processField = args => {
  const {
    node,
    fields,
    key,
    linkResolver,
    htmlSerializer,
    generateNodeId,
  } = args
  const linkResolverForField = linkResolver({ node, key, value })
  const htmlSerializerForField = htmlSerializer({ node, key, value })
  const value = fields[key]

  if (isRichTextField(value)) {
    return {
      ...fields,
      [key]: {
        html: PrismicDOM.RichText.asHtml(
          value,
          linkResolverForField,
          htmlSerializerForField,
        ),
        text: PrismicDOM.RichText.asText(value),
        raw: value,
      }
    }
  }

  if (isLinkField(value)) {
    switch (value.link_type) {
      case 'Document':
        if (!value.type && !value.id) {
          return {
            ...fields,
            [key]: undefined,
          }
        }

        return {
          ...fields,
          [key]: {
            document___NODE: [generateNodeId(value.type, value.id)],
            url: PrismicDOM.Link.url(value, linkResolverForField),
            raw: value,
          }
        }

      case 'Media':
      case 'Web':
        return {
          ...fields,
          [key]: {
            url: value.url,
            raw: value,
          }
        }

      default:
        return {
          ...fields,
          [key]: undefined,
        }
    }
  }

  return fields
}
