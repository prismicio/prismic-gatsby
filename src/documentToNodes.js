import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import PrismicDOM from 'prismic-dom'
import pascalcase from 'pascalcase'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

const IMAGE_FIELD_KEYS = ['dimensions', 'alt', 'copyright', 'url']

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

const normalizeImageField = async (_id, value, _depth, context) => {
  const { docNodeId, gatsbyContext } = context
  const { createNodeId, store, cache, actions } = gatsbyContext
  const { createNode } = actions

  let fileNode

  try {
    fileNode = await createRemoteFileNode({
      url: value.url,
      parentNodeId: docNodeId,
      store,
      cache,
      createNode,
      createNodeId,
    })
  } catch (error) {
    console.error(error)
  }

  return {
    ...value,
    localFile: fileNode ? fileNode.id : null,
  }
}

const normalizeField = async (id, value, depth, context) => {
  const { doc, enqueueNode, typePaths, gatsbyContext, pluginOptions } = context
  const { createNodeId, createContentDigest } = gatsbyContext
  const { linkResolver, htmlSerializer } = pluginOptions

  const linkResolverForField = linkResolver({ key: id, value, node: doc })
  const htmlSerializerForField = htmlSerializer({ key: id, value, node: doc })

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

    case 'PrismicStructuredTextType':
      return {
        html: PrismicDOM.RichText.asHtml(
          value,
          linkResolverForField,
          htmlSerializerForField,
        ),
        text: PrismicDOM.RichText.asText(value),
        raw: value,
      }

    case 'PrismicLinkType':
      return {
        ...value,
        url: PrismicDOM.Link.url(value, linkResolverForField),
      }

    case 'Group':
      return normalizeObjs(value, [...depth, id], context)

    case 'Slices':
      return R.compose(
        RA.allP,
        RA.mapIndexed(async (v, idx) => {
          const sliceNodeId = createNodeId(`${doc.type} ${doc.id} ${id} ${idx}`)

          const normalizedPrimary = await normalizeObj(
            R.propOr({}, 'primary', v),
            [...depth, id, v.slice_type, 'primary'],
            context,
          )

          const normalizedItems = await normalizeObjs(
            R.propOr([], 'items', v),
            [...depth, id, v.slice_type, 'items'],
            context,
          )

          enqueueNode({
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
  const { gatsbyContext } = context
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
