import util from 'util'
import * as R from 'ramda'

import PrismicDOM from 'prismic-dom'

import { generateTypeName, generateNodeId } from './nodeHelpers'

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
      return 'String'

    case 'StructuredText':
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
      return 'Float'

    case 'Date':
    case 'Timestamp':
      return 'Date'

    case 'GeoPoint':
      return 'PrismicGeoPointType'

    case 'Embed':
      return 'PrismicEmbedType'

    case 'Image':
      return 'PrismicImageType'

    case 'Link':
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

        sliceFields.primary = `${primaryName}`
      }

      if (itemsFields && !R.isEmpty(itemsFields)) {
        const itemsName = generateTypeName(
          `${customTypeId} ${sliceZoneId} ${id} Item Type`,
        )

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

      return `${sliceName}`

    case 'Slices':
      const choiceTypes = R.pipe(
        R.mapObjIndexed((choice, choiceId) =>
          fieldToType({
            ...args,
            id: choiceId,
            field: choice,
            context: { sliceZoneId: id },
          }),
        ),
        R.values,
      )(field.config.choices)

      const slicesName = generateTypeName(`${customTypeId} ${id} Slices Type`)

      enqueueTypeDef(
        gatsbySchema.buildUnionType({
          name: slicesName,
          types: choiceTypes,
        }),
      )

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

  const { uid, ...dataFields } = R.pipe(
    R.values,
    R.mergeAll,
    R.mapObjIndexed((field, fieldId) =>
      fieldToType({
        ...args,
        id: fieldId,
        field,
        context: {},
        enqueueTypeDef,
      }),
    ),
  )(customTypeJson)

  const dataName = generateTypeName(`${customTypeId} Data`)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: dataName,
      fields: dataFields,
    }),
  )

  const customTypeName = generateTypeName(customTypeId)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: customTypeName,
      fields: {
        uid: 'String',
        data: dataName,
      },
      interfaces: ['PrismicDocument', 'Node'],
    }),
  )

  return typeDefs
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
