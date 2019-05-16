import { createRemoteFileNode } from 'gatsby-source-filesystem'

export const normalizeImageField = async (_id, value, _depth, context) => {
  const { docNodeId, gatsbyContext } = context
  const { createNodeId, store, cache, actions } = gatsbyContext
  const { createNode } = actions

  let fileNode

  try {
    fileNode = await createRemoteFileNode({
      url: value.url,
      parentNodeId: docNodeId,
      store,
      cache,
      createNode,
      createNodeId,
    })
  } catch (error) {
    console.error(error)
  }

  return {
    ...value,
    localFile: fileNode ? fileNode.id : null,
  }
}
