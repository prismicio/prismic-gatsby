import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { normalizeFields } from './normalize'

const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })
const { createNodeFactory } = nodeHelpers

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { actions, createNodeId, store, cache } = gatsby
  const { createNode, touchNode } = actions
  const {
    repositoryName,
    accessToken,
    linkResolver = () => {},
    htmlSerializer = () => {},
    fetchLinks = [],
  } = pluginOptions

  const { documents } = await fetchData({
    repositoryName,
    accessToken,
    fetchLinks,
  })

  await Promise.all(
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
          createNodeId,
          touchNode,
          store,
          cache,
        })

        return node
      })

      const node = await Node(doc)
      createNode(node)
    }),
  )

  return
}
