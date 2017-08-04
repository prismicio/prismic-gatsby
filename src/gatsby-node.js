import fetchData from './fetch'
import { DocumentNode } from './nodes'

exports.sourceNodes = async (
  { boundActionCreators, getNodes, hasNodeChanged, store },
  { repositoryName, accessToken }
) => {
  const {
    createNode,
    deleteNodes,
    touchNode,
    setPluginStatus,
  } = boundActionCreators

  const {
    documents
  } = await fetchData({
    repositoryName,
    accessToken
  })

  documents.forEach(doc => {
    const node = DocumentNode({
      documentItem: doc
    })

    createNode(node)
  })

  return
}
