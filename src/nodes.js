import { camelCase, upperFirst } from 'lodash'
import { createHash } from 'crypto'
import stringify from 'json-stringify-safe'

const sourceId = `__SOURCE__`
const typePrefix = `Prismic`
const conflictFieldPrefix = `prismic`
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

const makeTypeName = type => upperFirst(camelCase(`${typePrefix} ${type}`))
const digest = str => createHash(`md5`).update(str).digest(`hex`)

// DocumentNode
//
// Each document is a DocumentNode. Data is available in the `data` property.
export const DocumentNode = ({
  documentItem: documentItemOriginal
}) => {
  const documentItem = Object.assign({}, documentItemOriginal)

  // Prefix conflicting keys.
  Object.keys(documentItem).forEach(key => {
    if (restrictedNodeFields.includes(key)) {
      documentItem[conflictFieldPrefix + upperFirst(key)] = documentItem[key]
      delete documentItem[key]
    }
  })

  // Need to use prismicId since the original id key conflicts with Gatsby.
  const node = {
    ...documentItem,
    id: documentItem.prismicId,
    parent: sourceId,
    children: [],
    internal: {
      type: makeTypeName(`Document`)
    }
  }

  node.internal.contentDigest = digest(stringify(node))

  return node
}
