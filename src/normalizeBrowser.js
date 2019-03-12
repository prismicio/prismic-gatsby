import PrismicDOM from 'prismic-dom'
import { map, reduce } from 'asyncro'

// Returns true if the field value appears to be a Rich Text field, false
// otherwise.
export const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

// Returns true if the field value appears to be a Link field, false otherwise.
export const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

// Returns true if the field value appears to be an Image field, false
// otherwise.
export const isImageField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('url') &&
  value.hasOwnProperty('dimensions') &&
  value.hasOwnProperty('alt') &&
  value.hasOwnProperty('copyright')

// Returns true if the key and value appear to be from a slice zone field,
// false otherwise.
export const isSliceField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type') &&
  (value[0].hasOwnProperty('primary') || value[0].hasOwnProperty('items'))

// Returns true if the field value appears to be a group field, false
// otherwise.
// NOTE: This check must be performed after isRichTextField and isSliceField.
export const isGroupField = value =>
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
const normalizeLinkField = (value, linkResolver) => {
  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id || value.isBroken) return undefined
      return {
        ...value,
        url: PrismicDOM.Link.url(value, linkResolver),
        target: value.target || '',
        raw: value,
      }

    case 'Media':
    case 'Web':
      return {
        ...value,
        target: value.target || '',
        raw: value,
      }

    default:
      return undefined
  }
}

// Normalizes an Image field.
const normalizeImageField = async ({ value, ...args }) => {
  const { alt, copyright, ...extraFields } = value

  for (const key in extraFields) {
    if (isImageField(value[key])) {
      value[key] = await normalizeImageField({
        ...args,
        key,
        value: value[key],
      })
    }
  }

  return {
    ...value,
    alt: alt || '',
    copyright: copyright || '',
  }
}

// Normalizes a slice zone field by recursively normalizing `item` and
// `primary` keys. It creates a node type for each slice type to ensure the
// slice key can handle multiple (i.e. union) types.
const normalizeSliceField = async args => {
  const { key: sliceKey, value: entries, node, nodeHelpers } = args
  const { createNodeFactory } = nodeHelpers

  const children = await map(entries, async (entry, index) => {
    // Create unique ID for the child using the parent node ID, the slice key,
    // and the index of the slice.
    entry.id = `${node.id}__${sliceKey}__${index}`

    const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`
    const EntryNode = createNodeFactory(entryNodeType, async entryNode => {
      entryNode.items = await normalizeGroupField({
        ...args,
        value: entryNode.items,
      })
      entryNode.primary = await normalizeBrowserFields({
        ...args,
        value: entryNode.primary,
      })

      return entryNode
    })

    const entryNode = await EntryNode(entry)

    return entryNode
  })

  return children
}

// Normalizes a group field by recursively normalizing each entry.
const normalizeGroupField = async args =>
  await map(
    args.value,
    async value => await normalizeBrowserFields({ ...args, value }),
  )

// Normalizes a field by determining its type and returning an enhanced version
// of it. If the type is not supported or needs no normalizing, it is returned
// as-is.
export const normalizeField = async args => {
  const { key, value, node, nodeHelpers, shouldNormalizeImage } = args
  let { linkResolver, htmlSerializer } = args
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return normalizeRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return normalizeLinkField(value, linkResolver, generateNodeId)

  if (
    isImageField(value) &&
    typeof shouldNormalizeImage === 'function' &&
    shouldNormalizeImage({ node, key, value })
  )
    return await normalizeImageField(args)

  if (isSliceField(value)) return await normalizeSliceField(args)

  if (isGroupField(value)) return await normalizeGroupField(args)

  return value
}

// Normalizes all fields in a key-value object.
export const normalizeBrowserFields = async args =>
  await reduce(
    Object.entries(args.value),
    async (acc, [key, value]) => {
      acc[key] = await normalizeField({ ...args, key, value })
      return acc
    },
    args.value,
  )
