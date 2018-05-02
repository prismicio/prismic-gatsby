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

const isDocumentLinkField = value =>
  typeof value === 'object' &&
  value.link_type === 'Document'

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
      Object.entries(node.data).forEach(([key, value]) => {
        // Process RichText fields. Provides html, text, raw, and rawString
        // fields to avoid prismic-dom usage client-side.
        if (isRichTextField(value)) {
          node.data[key] = {
            html: PrismicDOM.RichText.asHtml(
              value,
              linkResolver({ node, key, value }),
              htmlSerializer({ node, key, value }),
            ),
            text: PrismicDOM.RichText.asText(value),
            raw: value,
            rawString: JSON.stringify(value),
          }
        }

        // Process Link and Relation fields. Replaces value with related
        // document's node.
        if (isDocumentLinkField(value)) {
          node.data[`${key}___NODE`] = generateNodeId(value.type, value.id)
        }
      })

      return node
    })

    createNode(Node(doc))
  })
}
