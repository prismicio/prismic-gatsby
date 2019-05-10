import util from 'util'
import * as R from 'ramda'

import PrismicDOM from 'prismic-dom'

import { generateTypeName, generateNodeId } from './nodeHelpers'

const prettyLog = x => console.log(util.inspect(x, false, null, true))

// Returns a GraphQL type name given a field based on its type. If the type is
// is an object or union, the necessary type definition is enqueued on to the
// provided queue to be created at a later time.
const fieldToType = args => {
  const {
    id,
    field,
    customTypeId,
    context,
    enqueueTypeDef,
    enqueueTypePath,
    pluginOptions,
    gatsbyContext,
  } = args
  const { schema: gatsbySchema } = gatsbyContext
  const { linkResolver, htmlSerializer } = pluginOptions

  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'String',
      })
      return 'String'

    case 'StructuredText':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'PrismicStructuredTextType',
      })
      return {
        type: 'PrismicStructuredTextType',
        resolve: (parent, args, context, info) => {
          const key = info.path.key
          const value = parent[key]

          return {
            html: PrismicDOM.RichText.asHtml(
              value,
              linkResolver({ key, value }),
              htmlSerializer({ key, value }),
            ),
            text: PrismicDOM.RichText.asText(value),
          }
        },
      }

    case 'Number':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'Float',
      })
      return 'Float'

    case 'Date':
    case 'Timestamp':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'Date',
      })
      return 'Date'

    case 'GeoPoint':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'PrismicGeoPointType',
      })
      return 'PrismicGeoPointType'

    case 'Embed':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'PrismicEmbedType',
      })
      return 'PrismicEmbedType'

    case 'Image':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'PrismicImageType',
      })
      return 'PrismicImageType'

    case 'Link':
      enqueueTypePath({
        path: [...context.depth, id],
        type: 'PrismicLinkType',
      })
      return {
        type: 'PrismicLinkType',
        resolve: (parent, args, context, info) => {
          const key = info.path.key
          const value = parent[key]

          return {
            ...value,
            url: PrismicDOM.Link.url(value, linkResolver({ key, value })),
            document: context.nodeModel.getNodeById({
              id: generateNodeId(value.type, value.id),
            }),
          }
        },
      }

    case 'Group':
      const groupName = generateTypeName(`${customTypeId} ${id} Group Type`)
      const subfields = field.config.fields

      context.depth = [...context.depth, id]

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: groupName,
          fields: R.mapObjIndexed(
            (subfield, subfieldId) =>
              fieldToType({ ...args, id: subfieldId, field: subfield }),
            subfields,
          ),
        }),
      )

      context.depth.pop()

      enqueueTypePath({
        path: [...context.depth, id],
        type: `[${groupName}]`,
      })

      return `[${groupName}]`

    case 'Slice':
      const { sliceZoneId } = context
      const { 'non-repeat': primaryFields, repeat: itemsFields } = field

      const sliceFields = {
        id: 'String',
        slice_type: 'String',
      }

      if (primaryFields && !R.isEmpty(primaryFields)) {
        const primaryName = generateTypeName(
          `${customTypeId} ${sliceZoneId} ${id} Primary Type`,
        )

        context.depth = [...context.depth, id, 'primary']

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: primaryName,
            fields: R.mapObjIndexed(
              (primaryField, primaryFieldId) =>
                fieldToType({
                  ...args,
                  id: primaryFieldId,
                  field: primaryField,
                }),
              primaryFields,
            ),
          }),
        )

        enqueueTypePath({
          path: [...context.depth],
          type: primaryName,
        })

        context.depth.pop()
        context.depth.pop()

        sliceFields.primary = `${primaryName}`
      }

      if (itemsFields && !R.isEmpty(itemsFields)) {
        const itemsName = generateTypeName(
          `${customTypeId} ${sliceZoneId} ${id} Item Type`,
        )

        context.depth = [...context.depth, id, 'items']

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: itemsName,
            fields: R.mapObjIndexed(
              (itemField, itemFieldId) =>
                fieldToType({ ...args, id: itemFieldId, field: itemField }),
              itemsFields,
            ),
          }),
        )

        enqueueTypePath({
          path: [...context.depth],
          type: `[${itemsName}]`,
        })

        context.depth.pop()
        context.depth.pop()

        sliceFields.items = `[${itemsName}]`
      }

      const sliceName = generateTypeName(`${customTypeId} ${sliceZoneId} ${id}`)

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: sliceName,
          fields: sliceFields,
          interfaces: ['Node'],
        }),
      )

      enqueueTypePath({
        path: [...context.depth, id],
        type: sliceName,
      })

      return sliceName

    case 'Slices':
      context.depth = [...context.depth, id]

      const choiceTypes = R.pipe(
        R.mapObjIndexed((choice, choiceId) =>
          fieldToType({
            ...args,
            id: choiceId,
            field: choice,
            context: { ...context, sliceZoneId: id },
          }),
        ),
        R.values,
      )(field.config.choices)

      context.depth.pop()

      const slicesName = generateTypeName(`${customTypeId} ${id} Slices Type`)

      enqueueTypeDef(
        gatsbySchema.buildUnionType({
          name: slicesName,
          types: choiceTypes,
        }),
      )

      enqueueTypePath({
        path: [...context.depth, id],
        type: `[${slicesName}]`,
      })

      return {
        type: `[${slicesName}]`,
        resolve: (parent, args, context, info) => {
          return context.nodeModel.getNodesByIds({
            ids: parent[info.path.key],
          })
        },
      }

    default:
      console.log(`UNPROCESSED FIELD for type "${field.type}"`, id)
      return null
  }
}

export const generateTypeDefsForCustomType = args => {
  const { customTypeId, customTypeJson, gatsbyContext } = args
  const { schema: gatsbySchema } = gatsbyContext

  const typeDefs = []
  const enqueueTypeDef = typeDef => typeDefs.push(typeDef)

  const typePaths = []
  const enqueueTypePath = typePath => typePaths.push(typePath)

  // UID fields are defined at the same level as data fields, but are a level
  // about data in API responses. Pulling it out separately here allows us to
  // process the UID field differently than the data fields.
  const { uid: uidField, ...dataFields } = R.pipe(
    R.values,
    R.mergeAll,
  )(customTypeJson)

  // UID fields must be conditionally processed since not all custom types
  // implement a UID field.
  let uidFieldType
  if (uidField)
    uidFieldType = fieldToType({
      ...args,
      id: 'uid',
      field: uidField,
      context: { depth: [customTypeId] },
      enqueueTypePath,
    })

  const dataFieldTypes = R.mapObjIndexed(
    (field, fieldId) =>
      fieldToType({
        ...args,
        id: fieldId,
        field,
        context: {
          depth: [customTypeId, 'data'],
        },
        enqueueTypeDef,
        enqueueTypePath,
      }),
    dataFields,
  )

  const dataName = generateTypeName(`${customTypeId} Data`)

  enqueueTypePath({
    path: [customTypeId, 'data'],
    type: dataName,
  })

  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: dataName,
      fields: dataFieldTypes,
    }),
  )

  const customTypeName = generateTypeName(customTypeId)
  const customTypeFields = { data: dataName }
  if (uidFieldType) customTypeFields.uid = uidFieldType

  enqueueTypePath({
    path: [customTypeId],
    type: customTypeName,
  })

  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: customTypeName,
      fields: customTypeFields,
      interfaces: ['PrismicDocument', 'Node'],
    }),
  )

  return { typeDefs, typePaths }
}

export const generateTypeDefForLinkType = (allTypeDefs, gatsbySchema) => {
  const documentTypeNames = R.pipe(
    R.filter(
      R.pipe(
        R.pathOr([], ['config', 'interfaces']),
        R.contains('PrismicDocument'),
      ),
    ),
    R.map(R.path(['config', 'name'])),
  )(allTypeDefs)

  return gatsbySchema.buildUnionType({
    name: 'PrismicAllDocumentTypes',
    types: documentTypeNames,
  })
}
