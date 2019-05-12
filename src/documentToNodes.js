import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import pascalcase from 'pascalcase'
import { map, reduce } from 'asyncro'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

const getTypeForPath = (path, typePaths) =>
  R.compose(
    R.cond([
      [R.test(/^\[.*GroupType\]$/), R.always('Group')],
      [R.test(/^\[.*SlicesType\]$/), R.always('Slices')],
      [R.T, R.identity],
    ]),
    R.prop('type'),
    R.find(R.propEq('path', path)),
  )(typePaths)

const createRemoteFileNodeForUrl = async (url, context) => {
  const { docNodeId, gatsbyContext } = context
  const { createNodeId, store, cache, actions } = gatsbyContext
  const { createNode } = actions

  let fileNode

  try {
    fileNode = await createRemoteFileNode({
      url,
      parentNodeId: docNodeId,
      store,
      cache,
      createNode,
      createNodeId,
    })
  } catch (error) {
    console.error(error)
  }

  return fileNode
}

const IMAGE_FIELD_KEYS = ['dimensions', 'alt', 'copyright', 'url']

const normalizeImageField = async (_id, value, _depth, context) => {
  const localFile = await createRemoteFileNodeForUrl(value.url, context)

  return {
    ...value,
    localFile: localFile ? localFile.id : null,
  }
}

const normalizeField = async (id, value, depth, context) => {
  const { doc, docNodeId, enqueueNode, typePaths, gatsbyContext } = context
  const {
    createNodeId,
    createContentDigest,
    store,
    cache,
    actions,
  } = gatsbyContext
  const { createNode } = actions

  const type = getTypeForPath([...depth, id], typePaths)

  switch (type) {
    case 'PrismicImageType':
      const base = await R.compose(
        async baseValue =>
          await normalizeImageField(id, baseValue, depth, context),
        R.pick(IMAGE_FIELD_KEYS),
      )(value)

      // Thumbnail image data are siblings of the base image data so we need to
      // smartly extract and normalize the key-value pairs.
      const thumbs = await R.compose(
        R.then(R.fromPairs),
        RA.allP,
        R.map(async ([k, v]) => [
          k,
          await normalizeImageField(id, v, depth, context),
        ]),
        R.toPairs,
        R.omit(IMAGE_FIELD_KEYS),
      )(value)

      return {
        ...base,
        ...thumbs,
      }

    case 'Group':
      return normalizeObjs(value, [...depth, id], context)

    case 'Slices':
      const normalizedSlicesValue = await map(
        value,
        async (sliceValue, index) => {
          // const normalizedPrimary = await normalizeObj(
          //   R.propOr([], 'primary', sliceValue),
          //   [...depth, id, sliceValue.slice_type, 'primary'],
          //   context,
          // )

          // const normalizedItems = await normalizeObjs(
          //   R.propOr([], 'items', sliceValue),
          //   [...depth, id, sliceValue.slice_type, 'items'],
          //   context,
          // )

          // return {
          //   ...sliceValue,
          //   primary: normalizedPrimary,
          //   items: normalizedItems,
          // }

          const sliceNodeId = createNodeId(
            `${doc.type} ${doc.id} ${id} ${index}`,
          )

          const normalizedPrimary = await normalizeObj(
            R.propOr([], 'primary', sliceValue),
            [...depth, id, sliceValue.slice_type, 'primary'],
            context,
          )

          const normalizedItems = await normalizeObjs(
            R.propOr([], 'items', sliceValue),
            [...depth, id, sliceValue.slice_type, 'items'],
            context,
          )

          enqueueNode({
            ...sliceValue,
            id: sliceNodeId,
            primary: normalizedPrimary,
            items: normalizedItems,
            internal: {
              type: pascalcase(
                `Prismic ${doc.type} ${id} ${sliceValue.slice_type}`,
              ),
              contentDigest: createContentDigest(value),
            },
          })

          return sliceNodeId
        },
      )

      return normalizedSlicesValue

    default:
      return value
  }
}

// Returns a promise that resolves after normalizing each property in an
// object.
const normalizeObj = (obj, depth, context) =>
  R.compose(
    R.then(R.fromPairs),
    RA.allP,
    R.map(async ([k, v]) => [k, await normalizeField(k, v, depth, context)]),
    R.toPairs,
  )(obj)

// Returns a promise that resolves after normalizing a list of objects.
const normalizeObjs = (objs, depth, context) =>
  R.compose(
    RA.allP,
    R.map(obj => normalizeObj(obj, depth, context)),
  )(objs)

export const documentToNodes = async (doc, context) => {
  const { gatsbyContext, typePaths } = context
  const { createNodeId, createContentDigest } = gatsbyContext

  const nodes = []
  const enqueueNode = node => nodes.push(node)

  const docNodeId = createNodeId(`${doc.type} ${doc.id}`)
  const normalizedData = await normalizeObj(doc.data, [doc.type, 'data'], {
    ...context,
    doc,
    docNodeId,
    enqueueNode,
  })

  enqueueNode({
    ...doc,
    id: docNodeId,
    prismicId: doc.id,
    data: normalizedData,
    dataString: JSON.stringify(doc.data),
    internal: {
      type: pascalcase(`Prismic ${doc.type}`),
      contentDigest: createContentDigest(doc),
    },
  })

  return nodes
}
