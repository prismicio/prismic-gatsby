import PrismicDOM from 'prismic-dom'
import { createRemoteFileNode } from 'gatsby-source-filesystem'
import { map, reduce } from 'asyncro'

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

// Returns true if the field value appears to be an Image field, false
// otherwise.
const isImageField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('url') &&
  value.hasOwnProperty('dimensions') &&
  value.hasOwnProperty('alt') &&
  value.hasOwnProperty('copyright')

// Returns true if the key and value appear to be from a slice zone field,
// false otherwise.
const isSliceField = (key, value) =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type') &&
  (value[0].hasOwnProperty('primary') || value[0].hasOwnProperty('items'))

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
        ...value,
        document___NODE: [generateNodeId(value.type, value.id)],
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

// Normalizes an Image field by downloading the remote image and creating a
// File node using `gatsby-source-filesystem`. This allows for
// `gatsby-transformer-sharp` and `gatsby-image` integration. The linked node
// data is provided on the `localFile` key.
const normalizeImageField = async args => {
  const { value, createNode, createNodeId, store, cache, touchNode } = args
  const { alt, dimensions, copyright, url, ...extraFields } = value

  let fileNodeID
  const mediaDataCacheKey = `prismic-media-${url}`
  const cacheMediaData = await cache.get(mediaDataCacheKey)

  // If we have cached media data and it wasn't modified, reuse previously
  // created file node to not try to redownload.
  if (cacheMediaData) {
    fileNodeID = cacheMediaData.fileNodeID
    touchNode({ nodeId: cacheMediaData.fileNodeID })
  }

  // If we don't have cached data, download the file.
  if (!fileNodeID) {
    try {
      const fileNode = await createRemoteFileNode({
        url,
        store,
        cache,
        createNode,
        createNodeId,
      })

      if (fileNode) {
        fileNodeID = fileNode.id
        await cache.set(mediaDataCacheKey, { fileNodeID })
      }
    } catch (error) {
      console.log(error)
    }
  }

  for (const key in extraFields) {
    if (isImageField(value[key])) {
      value[key] = await normalizeImageField({
        ...args,
        key,
        value: value[key],
      })
    }
  }

  if (fileNodeID) {
    return {
      ...value,
      alt: alt || '',
      copyright: copyright || '',
      localFile___NODE: fileNodeID,
    }
  }

  return value
}

// Normalizes a slice zone field by recursively normalizing `item` and
// `primary` keys. It creates a node type for each slice type to ensure the
// slice key can handle multiple (i.e. union) types.
const normalizeSliceField = async args => {
  const { key: sliceKey, value: entries, node, nodeHelpers, createNode } = args
  const { createNodeFactory } = nodeHelpers

  const childrenIds = await reduce(
    entries,
    async (acc, entry, index) => {
      // Create unique ID for the child using the parent node ID, the slice key,
      // and the index of the slice.
      entry.id = `${node.id}__${sliceKey}__${index}`

      const entryNodeType = `${node.type}_${sliceKey}_${entry.slice_type}`
      const EntryNode = createNodeFactory(entryNodeType, async entryNode => {
        entryNode.items = await normalizeGroupField({
          ...args,
          value: entryNode.items,
        })
        entryNode.primary = await normalizeFields({
          ...args,
          value: entryNode.primary,
        })

        return entryNode
      })

      const entryNode = await EntryNode(entry)
      createNode(entryNode)

      return acc.concat([entryNode.id])
    },
    [],
  )

  // TODO: Remove hard-coded setter
  node.data[`${sliceKey}___NODE`] = childrenIds
  return undefined
}

// Normalizes a group field by recursively normalizing each entry.
const normalizeGroupField = async args =>
  await map(
    args.value,
    async value => await normalizeFields({ ...args, value }),
  )

// Normalizes a field by determining its type and returning an enhanced version
// of it. If the type is not supported or needs no normalizing, it is returned
// as-is.
export const normalizeField = async args => {
  const { key, value, node, nodeHelpers, normalizeImages } = args
  let { linkResolver, htmlSerializer } = args
  const { generateNodeId } = nodeHelpers

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return normalizeRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value))
    return normalizeLinkField(value, linkResolver, generateNodeId)

  if (normalizeImages && isImageField(value))
    return await normalizeImageField(args)

  if (isSliceField(key, value)) return await normalizeSliceField(args)

  if (isGroupField(value)) return await normalizeGroupField(args)

  return value
}

// Normalizes all fields in a key-value object.
export const normalizeFields = async args =>
  await reduce(
    Object.entries(args.value),
    async (acc, [key, value]) => {
      acc[key] = await normalizeField({ ...args, key, value })
      return acc
    },
    args.value,
  )
