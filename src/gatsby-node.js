import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { processField } from './processField'

const nodeHelpers = createNodeHelpers({ typePrefix: 'Prismic' })
const { createNodeFactory, generateNodeId } = nodeHelpers

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { boundActionCreators: { createNode } } = gatsby
  const { repositoryName, accessToken } = pluginOptions

  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(doc => {
    const Node = createNodeFactory(doc.type, node => {
      node.dataString = JSON.stringify(node.data)

      const allFields = Object.entries(node.data)
      const fields = allFields.filter(([key]) => !key.match(/body[0-9]*/))
      const slices = allFields.filter(([key]) => key.match(/body[0-9]*/))

      fields.forEach(([key, value]) => {
        node.data[key] = processField(
          key,
          value,
          node,
          pluginOptions,
          nodeHelpers,
        )
      })

      slices.forEach(([sliceKey, entries]) => {
        const primaryChildrenIds = []

        entries.forEach((entry, entryIndex) => {
          entry.id = entryIndex

          const entryNodeType = `${doc.type}_${sliceKey}_${entry.slice_type}`
          const EntryNode = createNodeFactory(entryNodeType, entryNode => {
            const entryFields = Object.entries(entryNode.primary)

            entryFields.forEach(([key, value]) => {
              entryNode.primary[key] = processField(
                key,
                value,
                node,
                pluginOptions,
                nodeHelpers,
              )
            })

            return entryNode
          })

          const entryNode = EntryNode(entry)
          createNode(entryNode)
          primaryChildrenIds.push(entryNode.id)
        })

        node.data[`${sliceKey}___NODE`] = primaryChildrenIds
        delete node.data[sliceKey]
      })

      return node
    })

    createNode(Node(doc))
  })
}
