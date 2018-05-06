import PrismicDOM from 'prismic-dom'

const isSliceZone = (key, value) =>
  typeof key === 'string' &&
  key.match(/body[0-9]*/) &&
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type')

const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

const processSliceZone = args => {
  const {
    key: sliceKey,
    value: entries,
    node,
    pluginOptions,
    nodeHelpers,
    createNode,
  } = args
  const { createNodeFactory } = nodeHelpers
  const childrenIds = []

  entries.forEach((entry, index) => {
    entry.id = index

    const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`
    const EntryNode = createNodeFactory(entryNodeType, entryNode => {
      const entryFields = Object.entries(entryNode.primary)

      entryFields.forEach(([key, value]) => {
        entryNode.primary[key] = processField({
          ...args,
          key,
          value,
        })
      })

      return entryNode
    })

    const entryNode = EntryNode(entry)
    createNode(entryNode)
    childrenIds.push(entryNode.id)
  })

  // TODO: Remove hard-coded setter
  node.data[`${sliceKey}___NODE`] = childrenIds
  return undefined
}

const processRichTextField = (value, linkResolver, htmlSerializer) => ({
  html: PrismicDOM.RichText.asHtml(value, linkResolver, htmlSerializer),
  text: PrismicDOM.RichText.asText(value),
  raw: value,
})

const processLinkField = (value, linkResolver, generateNodeId) => {
  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id) return undefined
      return {
        document___NODE: [generateNodeId(value.type, value.id)],
        url: PrismicDOM.Link.url(value, linkResolver),
        raw: value,
      }

    case 'Media':
    case 'Web':
      return {
        url: value.url,
        raw: value,
      }

    default:
      return undefined
  }
}

export const processField = args => {
  const { key, value, node, nodeHelpers } = args
  let { linkResolver, htmlSerializer } = args
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isSliceZone(key, value)) return processSliceZone(args)

  if (isRichTextField(value))
    return processRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return processLinkField(value, linkResolver, generateNodeId)

  return value
}
