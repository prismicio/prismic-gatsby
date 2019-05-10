import * as R from 'ramda'
import pascalcase from 'pascalcase'

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
    [R.T, R.always(undefined)],
  ])(type)
}

const normalizeField = args => {
  const {
    id,
    value,
    doc,
    context,
    enqueueNode,
    typePaths,
    gatsbyContext,
  } = args
  const { createNodeId, createContentDigest } = gatsbyContext

  const type = getTypeForPath([...context.depth, id], typePaths)

  switch (type) {
    case 'PrismicImageType':
      // Perform normalization
      return value

    case 'Group':
      context.depth = [...context.depth, id]

      const normalizedGroupValue = value.map(groupValue =>
        R.mapObjIndexed(
          (groupValueField, groupValueFieldId) =>
            normalizeField({
              ...args,
              id: groupValueFieldId,
              value: groupValueField,
            }),
          groupValue,
        ),
      )

      context.depth.pop()

      return normalizedGroupValue

    case 'SlicePrimary':
      context.depth = [...context.depth, id]

      const normalizedSlicePrimaryValue = R.mapObjIndexed(
        (primaryField, primaryFieldId) =>
          normalizeField({
            ...args,
            id: primaryFieldId,
            value: primaryField,
          }),
        value,
      )

      context.depth.pop()

      return normalizedSlicePrimaryValue

    case 'SliceItems':
      context.depth = [...context.depth, id]

      const normalizedSliceItemsValue = value.map(itemValue =>
        R.mapObjIndexed(
          (itemValueField, itemValueFieldId) =>
            normalizeField({
              ...args,
              id: itemValueFieldId,
              value: itemValueField,
            }),
          itemValue,
        ),
      )

      context.depth.pop()

      return normalizedSliceItemsValue

    case 'Slices':
      context.depth = [...context.depth, id]

      const normalizedSlicesValue = value.map((sliceValue, index) => {
        context.depth = [...context.depth, sliceValue.slice_type]

        const sliceNodeId = createNodeId(`${doc.type} ${doc.id} ${id} ${index}`)

        const normalizedSliceValue = {
          slice_type: sliceValue.slice_type,
        }

        if (sliceValue.primary && !R.isEmpty(sliceValue.primary)) {
          normalizedSliceValue.primary = normalizeField({
            ...args,
            id: 'primary',
            value: sliceValue.primary,
          })
        }

        if (sliceValue.primary && !R.isEmpty(sliceValue.primary)) {
          normalizedSliceValue.items = normalizeField({
            ...args,
            id: 'items',
            value: sliceValue.items,
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

        context.depth.pop()

        return sliceNodeId
      })

      context.depth.pop()

      return normalizedSlicesValue

    default:
      return value
  }
}

export const documentToNode = (doc, args) => {
  const { gatsbyContext } = args
  const { createNodeId, createContentDigest } = gatsbyContext

  const nodes = []
  const enqueueNode = node => nodes.push(node)

  const normalizedData = R.mapObjIndexed(
    (value, id) =>
      normalizeField({
        ...args,
        id,
        value,
        doc,
        context: {
          depth: [doc.type, 'data'],
        },
        enqueueNode,
      }),
    doc.data,
  )

  enqueueNode({
    ...doc,
    id: createNodeId(`${doc.type} ${doc.id}`),
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
