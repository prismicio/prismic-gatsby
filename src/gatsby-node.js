import createNodeHelpers from 'gatsby-node-helpers'
import PrismicDOM from 'prismic-dom'
import pipe from 'lodash/fp/pipe'
import fetchData from './fetch'

const { createNodeFactory } = createNodeHelpers({ typePrefix: `Prismic` })

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

const DocumentNode = createNodeFactory(`Document`, node => {
  Object.entries(node.data).forEach(([key, value]) => {
    // Provide HTML, text, and raw values for RichText fields.
    if (isRichTextField(value))
      node.data[key] = {
        html: PrismicDOM.RichText.asHtml(value),
        text: PrismicDOM.RichText.asText(value),
        raw: value,
      }
  })

  return node
})

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { repositoryName, accessToken }
) => {
  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(pipe(DocumentNode, createNode))
}
