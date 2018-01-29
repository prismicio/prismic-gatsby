import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'

const { createNodeFactory } = createNodeHelpers({ typePrefix: `Prismic` })

const DocumentNode = createNodeFactory(`Document`)

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { repositoryName, accessToken }
) => {
  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(document => {
    createNode(DocumentNode(document, { raw: JSON.stringify(document) }))
  })
}
