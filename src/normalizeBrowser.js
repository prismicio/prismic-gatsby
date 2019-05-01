import PrismicDOM from 'prismic-dom'
import Prismic from 'prismic-javascript'
import { map, reduce } from 'asyncro'
import {
  isRichTextField,
  isLinkField,
  isImageField,
  isSliceField,
  isGroupField,
} from './validations'

// 'store' acts as a cache when we are recursively retrieving documents from
// Prismic's API. Using Map() combined with Proxy() allows for lazy
// evaluation of Prismic documents and eliminates redundant API calls.
const store = new Map()

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
const normalizeLinkField = async args => {
  const { value, linkResolver, repositoryName, accessToken, fetchLinks } = args

  switch (value.link_type) {
    case 'Document':
      if (!value.type || !value.id || value.isBroken) return undefined

      if (!store.has(value.id)) {
        // Create a key in our cache to prevent infinite recursion.
        store.set(value.id, {})

        // Query Prismic's API for the actual document node and normalize it.
        const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
        const api = await Prismic.api(apiEndpoint, { accessToken })
        const node = await api.getByID(value.id, { fetchLinks })
        node.data = await normalizeBrowserFields({
          ...args,
          value: node.data,
          node: node,
        })

        // Now that we have this node's normallized data, place it in our cache.
        store.set(value.id, node)
      }

      return new Proxy(
        {
          ...value,
          url: PrismicDOM.Link.url(value, linkResolver),
          target: value.target || '',
          raw: value,
        },
        {
          get: (obj, prop) => {
            if (obj.hasOwnProperty(prop)) return obj[prop]
            if (prop === 'document') return [store.get(value.id)]
          },
        },
      )

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

    // At build time, Gatsby adds a __typename key to each node. We're
    // replicating that here.
    entryNode.__typename = entryNode.internal.type

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
  const { key, value, node, shouldNormalizeImage } = args
  let { linkResolver, htmlSerializer } = args

  linkResolver = linkResolver({ node, key, value })
  htmlSerializer = htmlSerializer({ node, key, value })

  if (isRichTextField(value))
    return normalizeRichTextField(value, linkResolver, htmlSerializer)

  if (isLinkField(value)) return await normalizeLinkField(args)

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
