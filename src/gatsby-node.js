import fetchData from './fetch'
import { normalizeFields } from './normalize'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'
import { createTemporaryMockNodes } from './createTemporaryMockNodes'

export const sourceNodes = async (gatsbyContext, pluginOptions) => {
  const {
    schema,
    actions: { createNode },
  } = gatsbyContext

  // Set default plugin options.
  pluginOptions = {
    linkResolver: () => undefined,
    htmlSerializer: () => undefined,
    fetchLinks: [],
    schemas: {},
    lang: '*',
    shouldNormalizeImage: () => true,
    ...pluginOptions,
  }

  const {
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
    schemas,
  } = pluginOptions

  await createTemporaryMockNodes({
    schemas,
    gatsbyContext,
  })

  const { documents } = await fetchData({
    repositoryName,
    accessToken,
    fetchLinks,
    lang,
  })

  const promises = documents.map(async doc => {
    const Node = createNodeFactory(doc.type, async node => {
      node.dataString = JSON.stringify(node.data)
      node.data = await normalizeFields({
        value: node.data,
        node,
        gatsbyContext,
        pluginOptions,
        nodeHelpers,
      })

      return node
    })

    const node = await Node(doc)

    createNode(node)
  })

  await Promise.all(promises)

  return
}

export const onPreExtractQueries = async (gatsbyContext, pluginOptions) => {
  const { schemas = {} } = pluginOptions

  await createTemporaryMockNodes({ schemas, gatsbyContext })
}
