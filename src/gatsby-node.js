import fetchData from './fetch'
import { normalizeFields } from './normalize'
import { hydrateGraphQLSchema } from './hydrateGraphQLSchema'
import { nodeHelpers, createNodeFactory, generateTypeName } from './nodeHelpers'
import { createTemporaryMockNodes } from './createTemporaryMockNodes'

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { actions, createNodeId, store, cache, emitter } = gatsby
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

  createTemporaryMockNodes({ schemas, emitter, createNode, deleteNode })

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

// this is just first API hook after "createPages" hook
// and before regenerating schema
export const onPreExtractQueries = ({ emitter, actions }, pluginOptions) => {
  const { schemas } = pluginOptions
  const { createNode, deleteNode } = actions

  createTemporaryMockNodes({ schemas, emitter, createNode, deleteNode })
}
