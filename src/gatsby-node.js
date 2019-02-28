import fetchData from './fetch'
import { normalizeFields } from './normalize'
import { nodeHelpers, createNodeFactory, generateTypeName } from './nodeHelpers'
import { createTemporaryMockNodes } from './createTemporaryMockNodes'

export const sourceNodes = async (gatsbyContext, pluginOptions) => {
  const { actions, createNodeId, store, cache } = gatsbyContext
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

  await createTemporaryMockNodes({
    schemas,
    gatsbyContext,
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

export const onPreExtractQueries = async (gatsbyContext, pluginOptions) => {
  const { schemas } = pluginOptions

  await createTemporaryMockNodes({ schemas, gatsbyContext })
}
