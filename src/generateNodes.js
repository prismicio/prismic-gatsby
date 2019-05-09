import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import pascalcase from 'pascalcase'

const getTypeForPath = (path, typeDefs) => {
  // return the type for the path
}

const normalizeField = async (doc, path, context) => {
  const { typeDefs } = context
  const type = getTypeForPath(path, typeDefs)
  const value = R.path(path, doc)

  switch (type) {
    case 'Group':
      return await map(
        value,
        async groupValue => await normalizeFields(groupValue, context),
      )

    case 'Slices':
    // do stuff for group

    case 'Image':
    // do stuff for group

    default:
      return value
  }
}

// Normalizes all fields in a key-value object.
export const normalizeFields = async (doc, path, context) =>
  await reduce(
    Object.entries(fields),
    async (acc, [key, value]) => {
      acc[key] = await normalizeField({ ...args, key, value })
      return acc
    },
    fields,
  )

export const documentToNodes = (doc, context) => {
  const { gatsbyContext } = context
  const { createNodeId, createContentDigest } = gatsbyContext

  const nodes = []
  const enqueueNode = node => nodes.push(node)

  const normalizedDoc = normalizeFields(doc, { ...context, enqueueNode })

  enqueueNode({
    ...normalizedDoc,
    dataString: JSON.stringify(doc.data),
    id: createNodeId(`${doc.type} ${doc.id}`),
    prismicId: doc.id,
    internal: {
      type: pascalcase(`Prismic ${doc.type}`),
      contentDigest: createContentDigest(doc),
    },
  })

  return nodes
}
