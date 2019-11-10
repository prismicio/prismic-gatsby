import PrismicDOM from 'prismic-dom'
import pascalcase from 'pascalcase'
import compose from 'compose-tiny'

import { IMAGE_FIELD_KEYS } from '../common/constants'
import { pick, omit, mapObj } from './utils'

const getTypeForPath = (path, typePaths) => {
  const stringifiedPath = JSON.stringify(path)
  const def = typePaths.find(x => JSON.stringify(x.path) === stringifiedPath)

  if (!def) return
  if (/^\[.*GroupType\]$/.test(def.type)) return 'Group'
  if (/^\[.*SlicesType\]$/.test(def.type)) return 'Slices'

  return def.type
}

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
        baseValue => normalizeImageField(id, baseValue, depth, context),
        pick(IMAGE_FIELD_KEYS),
      )(value)

      // Thumbnail image data are siblings of the base image data so we need to
      // smartly extract and normalize the key-value pairs.
      const thumbs = await compose(
        mapObj(async ([k, v]) => [
          k,
          await normalizeImageField(id, v, depth, context),
        ]),
        omit(IMAGE_FIELD_KEYS),
      )(value)

      return {
        ...base,
        thumbnails: Object.keys(thumbs).length > 0 ? thumbs : null,
      }

    case 'PrismicStructuredTextType':
      return await normalizeStructuredTextField(id, value, depth, context)

    case 'PrismicLinkType':
      return await normalizeLinkField(id, value, depth, context)

    case 'Group':
      return await normalizeObjs(value, [...depth, id], context)

    case 'Slices':
      const sliceNodeIds = await Promise.all(
        value.map(async (v, idx) => {
          const sliceNodeId = createNodeId(`${doc.type} ${doc.id} ${id} ${idx}`)

          const normalizedPrimary = await normalizeObj(
            v.primary || {},
            [...depth, id, v.slice_type, 'primary'],
            context,
          )

          const normalizedItems = await normalizeObjs(
            v.items || [],
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
      )

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
const normalizeObj = async (obj = {}, depth, context) =>
  await mapObj(async ([k, v]) => [
    k,
    await normalizeField(k, v, depth, context),
  ])(obj)

// Returns a promise that resolves after normalizing a list of objects.
const normalizeObjs = (objs = [], depth, context) =>
  Promise.all(objs.map(obj => normalizeObj(obj, depth, context)))

export const documentToNodes = async (doc, context) => {
  const {
    createNodeId,
    createContentDigest,
    createNode,
    pluginOptions,
  } = context
  const { linkResolver } = pluginOptions

  const docNodeId = createNodeId(`${doc.type} ${doc.id}`)
  const normalizedData = await normalizeObj(doc.data, [doc.type, 'data'], {
    ...context,
    doc,
    docNodeId,
  })

  const linkResolverForDoc = linkResolver({ node: doc })

  createNode({
    ...doc,
    id: docNodeId,
    prismicId: doc.id,
    data: normalizedData,
    dataString: JSON.stringify(doc.data),
    dataRaw: doc.data,
    url: linkResolverForDoc(doc),
    internal: {
      type: pascalcase(`Prismic ${doc.type}`),
      contentDigest: createContentDigest(doc),
    },
  })

  return docNodeId
}
