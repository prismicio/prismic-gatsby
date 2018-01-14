import createNodeHelpers from 'gatsby-node-helpers'
import pipe from 'lodash/fp/pipe'
import fetchData from './fetch'

const { createNodeFactory } = createNodeHelpers({ typePrefix: `Prismic` })

const DocumentNode = createNodeFactory(`Document`)

export const sourceNodes = async (
  { boundActionCreators: { createNode } },
  { repositoryName, accessToken }
) => {
  const { documents } = await fetchData({ respositoryName, accessToken })

  documents.forEach(pipe(DocumentNode, createNode))
}
