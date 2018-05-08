import PrismicDOM from 'prismic-dom'

// Returns true if the key and value appear to be from a slice zone field,
// false otherwise.
const isSliceZone = (key, value) =>
  key.match(/body[0-9]*/) &&
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type')

// Returns true if the field value appears to be a Rich Text field, false
// otherwise.
const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

// Returns true if the field value appears to be a Link field, false otherwise.
const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

// Returns true if the field value appears to be a group field, false
// otherwise.
// NOTE: This check must be performed after isRichTextField and isSliceZone.
const isGroupField = value =>
  Array.isArray(value) && typeof value[0] === 'object'

// Processes a slice zone field by recursively processing `item` and `primary`
// keys. It creates a node type for each slice type to ensure the slice key can
// handle multiple (i.e. union) types.
const processSliceZone = args => {
  const { key: sliceKey, value: entries, node, nodeHelpers, createNode } = args
  const { createNodeFactory } = nodeHelpers
  const childrenIds = []

  entries.forEach((entry, index) => {
    entry.id = index

    const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`
    const EntryNode = createNodeFactory(entryNodeType, entryNode => {
      entryNode.items = processGroupField({ ...args, value: entryNode.items })
      entryNode.primary = processFields({ ...args, value: entryNode.primary })

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

// Processes a group field by recursively processing each entry.
const processGroupField = args => {
  const { value: entries } = args
  return entries.map(entry => processFields({ ...args, value: entry }))
}

// Processes a rich text field by providing HTML and text versions of the value
// using `prismic-dom` on the `html` and `text` keys, respectively. The raw
// value is provided on the `raw` key.
const processRichTextField = (value, linkResolver, htmlSerializer) => ({
  html: PrismicDOM.RichText.asHtml(value, linkResolver, htmlSerializer),
  text: PrismicDOM.RichText.asText(value),
  raw: value,
})

// Processes a link field by providing a resolved URL using `prismic-dom` on
// the `url` field. If the value is an external link, the value is provided
// as-is. If the value is a document link, the document's data is provided on
// the `document` key.
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

// Processes all fields in a key-value object.
export const processFields = args => {
  const { value: fields } = args

  Object.entries(fields).forEach(([key, value]) => {
    fields[key] = processField({ ...args, key, value })
  })

  return fields
}

// Processes a field by determining its type and returning an enhanced version
// of it. If the type is not supported or needs no processing, it is returned
// as-is.
export const processField = args => {
  const { key, value, node, nodeHelpers } = args
  let { linkResolver, htmlSerializer } = args
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return processRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return processLinkField(value, linkResolver, generateNodeId)

  if (isSliceZone(key, value)) return processSliceZone(args)

  if (isGroupField(value)) return processGroupField(args)

  return value
}
