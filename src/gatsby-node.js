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
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

const isLinkDocumentField = value =>
  isLinkField(value) && value.link_type === 'Document'

const isLinkWebField = value => isLinkField(value) && value.link_type === 'Web'

const isLinkAnyField = value =>
  isLinkField(value) && !isLinkDocumentField(value) && !isLinkWebField(value)

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
      node.dataString = JSON.stringify(node)

      Object.entries(node.data).forEach(([key, value]) => {
        const linkResolverForField = linkResolver({ node, key, value })
        const htmlSerializerForField = htmlSerializer({ node, key, value })

        if (isRichTextField(value)) {
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

        if (isLinkDocumentField(value)) {
          if (!value.type && !value.id) {
            delete node.data[key]
            return
          }

          node.data[key] = {
            document___NODE: [generateNodeId(value.type, value.id)],
            url: PrismicDOM.Link.url(value, linkResolverForField),
            raw: value,
          }
          return
        }

        if (isLinkWebField(value)) {
          if (!value.url) {
            delete node.data[key]
            return
          }

          node.data[key] = {
            url: value.url,
            raw: value,
          }
          return
        }

        if (isLinkAnyField(value)) {
          delete node.data[key]
          return
        }
      })

      return node
    })

    createNode(Node(doc))
  })
}
