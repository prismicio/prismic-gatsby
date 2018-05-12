import PrismicDOM from 'prismic-dom'

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

// Returns true if the key and value appear to be from a slice zone field,
// false otherwise.
const isSliceField = (key, value) =>
  key.match(/body[0-9]*/) &&
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type')

// Returns true if the field value appears to be a group field, false
// otherwise.
// NOTE: This check must be performed after isRichTextField and isSliceField.
const isGroupField = value =>
  Array.isArray(value) && typeof value[0] === 'object'

// Normalizes a rich text field by providing HTML and text versions of the
// value using `prismic-dom` on the `html` and `text` keys, respectively. The
// raw value is provided on the `raw` key.
const normalizeRichTextField = (value, linkResolver, htmlSerializer) => ({
  html: PrismicDOM.RichText.asHtml(value, linkResolver, htmlSerializer),
  text: PrismicDOM.RichText.asText(value),
  raw: value,
})

// Normalizes a link field by providing a resolved URL using `prismic-dom` on
// the `url` field. If the value is an external link, the value is provided
// as-is. If the value is a document link, the document's data is provided on
// the `document` key.
const normalizeLinkField = (value, linkResolver, generateNodeId) => {
  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id || value.isBroken) return undefined
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

// Normalizes a slice zone field by recursively normalizing `item` and
// `primary` keys. It creates a node type for each slice type to ensure the
// slice key can handle multiple (i.e. union) types.
const normalizeSliceField = args => {
  const { key: sliceKey, value: entries, node, nodeHelpers, createNode } = args
  const { createNodeFactory } = nodeHelpers
  const childrenIds = []

  entries.forEach((entry, index) => {
    // Create unique ID for the child using the parent node ID, the slice key,
    // and the index of the slice.
    entry.id = `${node.id}__${sliceKey}__${index}`

    const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`
    const EntryNode = createNodeFactory(entryNodeType, entryNode => {
      entryNode.items = normalizeGroupField({ ...args, value: entryNode.items })
      entryNode.primary = normalizeFields({ ...args, value: entryNode.primary })

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

// Normalizes a group field by recursively normalizing each entry.
const normalizeGroupField = args =>
  args.value.map(value => normalizeFields({ ...args, value }))

// Normalizes a field by determining its type and returning an enhanced version
// of it. If the type is not supported or needs no normalizing, it is returned
// as-is.
export const normalizeField = args => {
  const { key, value, node, nodeHelpers } = args
  let { linkResolver, htmlSerializer } = args
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return normalizeRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return normalizeLinkField(value, linkResolver, generateNodeId)

  if (isSliceField(key, value)) return normalizeSliceField(args)

  if (isGroupField(value)) return normalizeGroupField(args)

  return value
}

// Normalizes all fields in a key-value object.
export const normalizeFields = args =>
  Object.entries(args.value).reduce((acc, [key, value]) => {
    acc[key] = normalizeField({ ...args, key, value })
    return acc
  }, args.value)
