import { camelCase, upperFirst } from 'lodash'
import { createHash } from 'crypto'
import stringify from 'json-stringify-safe'

const sourceId = `__SOURCE__`
const typePrefix = `Prismic`
const conflictFieldPrefix = `prismic`
const prismicMediaType = `application/x-prismic-v2`
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))
const digest = str => createHash(`md5`).update(str).digest(`hex`)

// TypeNode
//
// Each custom type is a TypeNode. Documents using the custom type are child
// nodes.
export const TypeNode = ({
  customTypeItem
}) => {
  const node = {
    id: customTypeItem.id,
    parent: sourceId,
    children: [],
    name: customTypeItem.name,
    internal: {
      type: makeTypeName(`${upperFirst(customTypeItem.name)}Type`)
    }
  }

  node.internal.contentDigest = digest(stringify(node))

  return node
}

// DocumentNode
//
// Each document is a DocumentNode. Non-content fields (e.g. lang,
// first_puglication_date, slugs) are added as fields on the node. Content
// fields are to be processed into child nodes.
export const DocumentNode = ({
  customTypeItem,
  customTypeDocumentItem: customTypeDocumentItemOrig
}) => {
  const customTypeDocumentItem = Object.assign({}, customTypeDocumentItemOrig)

  // Prefix conflicting keys.
  Object.keys(customTypeDocumentItem).forEach(key => {
    if (restrictedNodeFields.includes(key)) {
      customTypeDocumentItem[`${conflictFieldPrefix}${upperFirst(key)}`] = customTypeDocumentItem[key]
      delete customTypeDocumentItem[key]
    }
  })

  // Need to use prismicId since the original id key conflicts with Gatsby.
  const node = {
    id: customTypeDocumentItem.prismicId,
    parent: customTypeItem.id,
    children: [],
    internal: {
      type: makeTypeName(`Document`)
    },
    ...customTypeDocumentItem
  }

  node.internal.contentDigest = digest(stringify(node))

  return node
}

// DatumNode
//
// Each document data item is a DatumNode. Prismic's custom JSON content format
// is stringified as the node's content. This will later be parsed again by a
// transformer.
export const DatumNode = ({
  customTypeDocumentItem,
  customTypeDocumentDatumItem
}) => {
  const str = stringify(customTypeDocumentDatumItem)

  const node = {
    id: customTypeDocumentDatumItem.id,
    parent: customTypeDocumentItem.id,
    children: [],
    internal: {
      mediaType: 'application/x-prismic-v2',
      type: makeTypeName(`Datum`),
      content: str,
      contentDigest: digest(str)
    }
  }

  return node
}
