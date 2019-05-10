import * as R from 'ramda'
import pascalcase from 'pascalcase'
import { map, reduce } from 'asyncro'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

const getTypeForPath = (path, typePaths) => {
  const type = R.pipe(
    R.find(R.propEq('path', path)),
    R.prop('type'),
  )(typePaths)

  if (!type) return undefined

  return R.cond([
    [R.endsWith('GroupType]'), R.always('Group')],
    [R.endsWith('SlicesType]'), R.always('Slices')],
    [R.endsWith('ItemType]'), R.always('SliceItems')],
    [R.endsWith('PrimaryType'), R.always('SlicePrimary')],
    [R.endsWith('Data'), R.always('Data')],
    [R.T, R.always(type)],
  ])(type)
}

const normalizeField = async args => {
  const {
    id,
    value,
    doc,
    docNodeId,
    depth,
    enqueueNode,
    typePaths,
    gatsbyContext,
  } = args
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
    case 'Data':
      const normalizedData = await normalizeFields(value, {
        ...args,
        depth: [...depth, 'data'],
      })

      return normalizedData

    case 'PrismicImageType':
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
      } catch (_error) {
        // Ignore
        console.error(_error)
      }

      const normalizedImageValue = { ...value }

      if (fileNode) normalizedImageValue.localFile = fileNode.id

      return normalizedImageValue

    case 'Group':
      const normalizedGroupValue = await map(
        value,
        async groupValue =>
          await normalizeFields(groupValue, { ...args, depth: [...depth, id] }),
      )

      return normalizedGroupValue

    case 'SlicePrimary':
      const normalizedSlicePrimaryValue = await normalizeFields(value, {
        ...args,
        depth: [...depth, id],
      })

      return normalizedSlicePrimaryValue

    case 'SliceItems':
      const normalizedSliceItemsValue = await map(
        value,
        async itemValue =>
          await normalizeFields(itemValue, {
            ...args,
            depth: [...depth, id],
          }),
      )

      return normalizedSliceItemsValue

    case 'Slices':
      const normalizedSlicesValue = await map(
        value,
        async (sliceValue, index) => {
          const sliceNodeId = createNodeId(
            `${doc.type} ${doc.id} ${id} ${index}`,
          )

          const normalizedSliceValue = {
            slice_type: sliceValue.slice_type,
          }

          if (sliceValue.primary && !R.isEmpty(sliceValue.primary)) {
            normalizedSliceValue.primary = await normalizeField({
              ...args,
              id: 'primary',
              value: sliceValue.primary,
              depth: [...depth, id, sliceValue.slice_type],
            })
          }

          if (sliceValue.primary && !R.isEmpty(sliceValue.primary)) {
            normalizedSliceValue.items = await normalizeField({
              ...args,
              id: 'items',
              value: sliceValue.items,
              depth: [...depth, id, sliceValue.slice_type],
            })
          }

          enqueueNode({
            ...normalizedSliceValue,
            id: sliceNodeId,
            prismicId: value.id,
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

export const normalizeFields = async (fields, args) => {
  return await reduce(
    Object.entries(fields),
    async (acc, [id, value]) => {
      acc[id] = await normalizeField({
        ...args,
        id,
        value,
      })
      return acc
    },
    fields,
  )
}

export const documentToNodes = async (doc, args) => {
  const { gatsbyContext, typePaths } = args
  const { createNodeId, createContentDigest } = gatsbyContext

  const nodes = []
  const enqueueNode = node => nodes.push(node)

  const docNodeId = createNodeId(`${doc.type} ${doc.id}`)
  const normalizedData = await normalizeField({
    ...args,
    id: 'data',
    value: doc.data,
    doc,
    docNodeId,
    depth: [doc.type],
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
