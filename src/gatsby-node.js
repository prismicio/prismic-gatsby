import createNodeHelpers from 'gatsby-node-helpers'
import PrismicDOM from 'prismic-dom'
import fetchData from './fetch'

const { createNodeFactory } = createNodeHelpers({ typePrefix: `Prismic` })

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  {
    repositoryName,
    accessToken,
    linkResolver = () => undefined,
    htmlSerializer = () => undefined,
  },
) => {
  const DocumentNode = createNodeFactory(`Document`, node => {
    Object.entries(node.data).forEach(([key, value]) => {
      const htmlOptions = { node, key, value }

      // Provide HTML, text, raw, and rawString values for RichText fields.
      if (isRichTextField(value))
        node.data[key] = {
          html: PrismicDOM.RichText.asHtml(
            value,
            linkResolver(htmlOptions),
            htmlSerializer(htmlOptions),
          ),
          text: PrismicDOM.RichText.asText(value),
          raw: value,
          rawString: JSON.stringify(value),
        }
    })

    return node
  })

  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(doc => createNode(DocumentNode(doc)))
}
