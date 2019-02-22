import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { normalizeFields } from './normalize'
import { hydrateGraphQLSchema } from './hydrateGraphQLSchema'

const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })
const { createNodeFactory } = nodeHelpers

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { actions, createNodeId, store, cache } = gatsby
  const { createNode, touchNode, deleteNode } = actions
  const {
    repositoryName,
    accessToken,
    linkResolver = () => {},
    htmlSerializer = () => {},
    fetchLinks = [],
    lang = '*',
    shouldNormalizeImage = () => true,
    schemas,
  } = pluginOptions

  const { documents } = await fetchData({
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
  })

  await hydrateGraphQLSchema({ schemas, createNode, deleteNode })

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
          shouldNormalizeImage,
        })

        return node
      })

      const node = await Node(doc)
      createNode(node)
    }),
  )

  return
}
