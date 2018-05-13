import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { normalizeFields } from './normalize'

const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })
const { createNodeFactory, generateNodeId } = nodeHelpers

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { boundActionCreators, store, cache } = gatsby
  const { createNode, touchNode } = boundActionCreators
  const {
    repositoryName,
    accessToken,
    linkResolver = () => {},
    htmlSerializer = () => {},
  } = pluginOptions

  const { documents } = await fetchData({ repositoryName, accessToken })

  return await Promise.all(
    documents.map(async doc => {
      const Node = createNodeFactory(doc.type, async node => {
        node.dataString = JSON.stringify(node.data)
        node.data = await normalizeFields({
          value: node.data,
          node,
          linkResolver,
          htmlSerializer,
          nodeHelpers,
          createNode,
          touchNode,
          store,
          cache,
        })

        return node
      })

      createNode(await Node(doc))
    }),
  )
}
