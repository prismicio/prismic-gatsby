import createNodeHelpers from 'gatsby-node-helpers'
import PrismicDOM from 'prismic-dom'
import fetchData from './fetch'

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'Prismic',
})

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

const isLinkField = value =>
  !!value && typeof value === 'object' && value.hasOwnProperty('link_type')

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { boundActionCreators: { createNode } } = gatsby
  const {
    repositoryName,
    accessToken,
    linkResolver = () => undefined,
    htmlSerializer = () => undefined,
  } = pluginOptions

  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(doc => {
    const Node = createNodeFactory(doc.type, node => {
      // Add node.data as a string for parsing client-side. Functionality of
      // this plugin should be enough that this field is rarely used.
      node.dataString = JSON.stringify(node)

      // Iterate each field and process as necessary.
      Object.entries(node.data).forEach(([key, value]) => {
        const linkResolverForField = linkResolver({ node, key, value })
        const htmlSerializerForField = htmlSerializer({ node, key, value })

        if (isRichTextField(value)) {
          // Replace the field with an object containing the following keys:
          //
          // - html: The field's data provided as HTML via prismic-dom
          // - text: The field's data provided as text via prismic-dom
          // - raw:  The field's raw data
          node.data[key] = {
            html: PrismicDOM.RichText.asHtml(
              value,
              linkResolverForField,
              htmlSerializerForField,
            ),
            text: PrismicDOM.RichText.asText(value),
            raw: value,
          }
          return
        }

        if (isLinkField(value)) {
          // If the field links to a document, replace the field with an object
          // containing the following keys:
          //
          // - url:      The linked document's url via the linkResolver
          // - document: The linked document's data
          if (value.link_type === 'Document' && value.type && value.id) {
            node.data[key] = {
              url: PrismicDOM.Link.url(value, linkResolverForField),
              document___NODE: [generateNodeId(value.type, value.id)],
            }
            return
          }

          // If the field links to an external URL, replace the field with an
          // object containing the following keys:
          //
          // - url: The linked url
          if (value.link_type === 'Web' && value.url) {
            node.data[key] = {
              url: value.url,
            }
            return
          }

          // If the field does not match one of the above link types, delete
          // the field; the field is considered empty.
          delete node.data[key]
          return
        }
      })

      return node
    })

    createNode(Node(doc))
  })
}
