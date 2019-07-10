import {
  compose,
  cond,
  test,
  always,
  T,
  identity,
  prop,
  find,
  propEq,
  pick,
  then,
  fromPairs,
  map,
  toPairs,
  omit,
  propOr,
} from 'ramda'
import { allP, mapIndexed } from 'ramda-adjunct'
import pascalcase from 'pascalcase'

const IMAGE_FIELD_KEYS = ['dimensions', 'alt', 'copyright', 'url', 'localFile']

const getTypeForPath = (path, typePaths) =>
  compose(
    cond([
      [test(/^\[.*GroupType\]$/), always('Group')],
      [test(/^\[.*SlicesType\]$/), always('Slices')],
      [T, identity],
    ]),
    prop('type'),
    find(propEq('path', path)),
  )(typePaths)

const normalizeField = async (id, value, depth, context) => {
  const {
    doc,
    typePaths,
    createNode,
    createNodeId,
    createContentDigest,
    normalizeImageField,
    normalizeLinkField,
    normalizeSlicesField,
    normalizeStructuredTextField,
  } = context

  const type = getTypeForPath([...depth, id], typePaths)

  switch (type) {
    case 'PrismicImageType':
      const base = await compose(
        async baseValue =>
          await normalizeImageField(id, baseValue, depth, context),
        pick(IMAGE_FIELD_KEYS),
      )(value)

      // Thumbnail image data are siblings of the base image data so we need to
      // smartly extract and normalize the key-value pairs.
      const thumbs = await compose(
        then(fromPairs),
        allP,
        map(async ([k, v]) => [
          k,
          await normalizeImageField(id, v, depth, context),
        ]),
        toPairs,
        omit(IMAGE_FIELD_KEYS),
      )(value)

      return {
        ...base,
        ...thumbs,
      }

    case 'PrismicStructuredTextType':
      return await normalizeStructuredTextField(id, value, depth, context)

    case 'PrismicLinkType':
      return await normalizeLinkField(id, value, depth, context)

    case 'Group':
      return await normalizeObjs(value, [...depth, id], context)

    case 'Slices':
      const sliceNodeIds = await compose(
        allP,
        mapIndexed(async (v, idx) => {
          const sliceNodeId = createNodeId(`${doc.type} ${doc.id} ${id} ${idx}`)

          const normalizedPrimary = await normalizeObj(
            propOr({}, 'primary', v),
            [...depth, id, v.slice_type, 'primary'],
            context,
          )

          const normalizedItems = await normalizeObjs(
            propOr([], 'items', v),
            [...depth, id, v.slice_type, 'items'],
            context,
          )

          createNode({
            ...v,
            id: sliceNodeId,
            primary: normalizedPrimary,
            items: normalizedItems,
            internal: {
              type: pascalcase(`Prismic ${doc.type} ${id} ${v.slice_type}`),
              contentDigest: createContentDigest(v),
            },
          })

          return sliceNodeId
        }),
      )(value)

      return await normalizeSlicesField(
        id,
        sliceNodeIds,
        [...depth, id],
        context,
      )

    default:
      return value
  }
}

// Returns a promise that resolves after normalizing each property in an
// object.
const normalizeObj = (obj, depth, context) =>
  compose(
    then(fromPairs),
    allP,
    map(async ([k, v]) => [k, await normalizeField(k, v, depth, context)]),
    toPairs,
  )(obj)

// Returns a promise that resolves after normalizing a list of objects.
const normalizeObjs = (objs, depth, context) =>
  compose(
    allP,
    map(obj => normalizeObj(obj, depth, context)),
  )(objs)

export const documentToNodes = async (doc, context) => {
  const { createNodeId, createContentDigest, createNode } = context

  const docNodeId = createNodeId(`${doc.type} ${doc.id}`)
  const normalizedData = await normalizeObj(doc.data, [doc.type, 'data'], {
    ...context,
    doc,
    docNodeId,
  })

  createNode({
    ...doc,
    id: docNodeId,
    prismicId: doc.id,
    data: normalizedData,
    dataString: JSON.stringify(doc.data),
    dataRaw: doc.data,
    internal: {
      type: pascalcase(`Prismic ${doc.type}`),
      contentDigest: createContentDigest(doc),
    },
  })

  return docNodeId
}
