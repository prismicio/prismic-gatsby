import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { processField } from './processField'

const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })
const { createNodeFactory, generateNodeId } = nodeHelpers

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { boundActionCreators: { createNode } } = gatsby
  const {
    repositoryName,
    accessToken,
    linkResolver = () => {},
    htmlSerializer = () => {},
  } = pluginOptions

  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(doc => {
    const Node = createNodeFactory(doc.type, node => {
      node.dataString = JSON.stringify(node.data)

      Object.entries(node.data).forEach(([key, value]) => {
        node.data[key] = processField({
          key,
          value,
          node,
          linkResolver,
          htmlSerializer,
          nodeHelpers,
          createNode,
        })
      })

      return node
    })

    createNode(Node(doc))
  })
}
