import { camelCase, upperFirst } from 'lodash'
import { createHash } from 'crypto'
import stringify from 'json-stringify-safe'

const sourceId = `__SOURCE__`
const typePrefix = `Prismic`
const conflictFieldPrefix = `prismic`
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
      type: makeTypeName(`${upperFirst(customTypeItem.name)} Type`)
    }
  }

  node.internal.contentDigest = digest(stringify(node))

  return node
}

// DocumentNode
//
// Each document is a DocumentNode. Data is available in the `data` property.
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
    ...customTypeDocumentItem,
    id: customTypeDocumentItem.prismicId,
    parent: customTypeItem.id,
    children: [],
    internal: {
      type: makeTypeName(`Document`)
    },
  }

  node.internal.contentDigest = digest(stringify(node))

  return node
}
