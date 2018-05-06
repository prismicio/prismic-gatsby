import createNodeHelpers from 'gatsby-node-helpers'
import fetchData from './fetch'
import { processField } from './processField'

const { createNodeFactory, generateNodeId } = createNodeHelpers({
  typePrefix: 'Prismic',
})

export const sourceNodes = async (gatsby, pluginOptions) => {
  const { boundActionCreators: { createNode } } = gatsby
  const {
    repositoryName,
    accessToken,
    linkResolver = () => undefined,
    htmlSerializer = () => undefined,
  } = pluginOptions

  const { documents } = await fetchData({ repositoryName, accessToken })

  documents.forEach(doc => {
    const Node = createNodeFactory(doc.type, node => {
      node.dataString = JSON.stringify(node.data)

      const allFieldKeys = Object.keys(node.data)
      const fieldKeys = allFieldKeys.filter(k => !k.match(/body[0-9]*/))
      const sliceKeys = allFieldKeys.filter(k => k.match(/body[0-9]*/))

      fieldKeys.forEach(key =>
        node.data = processField({
          node,
          fields: node.data,
          key,
          linkResolver,
          htmlSerializer,
          generateNodeId,
        }),
      )

      sliceKeys.forEach(sliceKey => {
        const entries = node.data[sliceKey]
        const childEntryNodeIds = []

        entries.forEach((entry, entryIndex) => {
          entry.id = entryIndex

          const EntryNode = createNodeFactory(`${doc.type}_${sliceKey}_${entry.slice_type}`, entryNode => {
            const entryFieldKeys = Object.keys(entryNode.primary)

            entryFieldKeys.forEach(key =>
              entryNode.primary = processField({
                node,
                fields: entry.primary,
                key,
                linkResolver,
                htmlSerializer,
                generateNodeId,
              })
            )

            return entryNode
          })

          const entryNode = EntryNode(entry)
          createNode(entryNode)

          childEntryNodeIds.push(entryNode.id)
        })

        node.data[`${sliceKey}___NODE`] = childEntryNodeIds
        delete node.data[sliceKey]
      })

      return node
    })

    createNode(Node(doc))
  })
}
