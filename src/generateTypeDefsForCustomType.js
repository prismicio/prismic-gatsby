import * as R from 'ramda'

import { generateTypeName } from './nodeHelpers'

// Returns a GraphQL type name given a field based on its type. If the type is
// is an object or union, the necessary type definition is enqueued on to the
// provided queue to be created at a later time.
const fieldToTypeName = args => {
  const {
    id,
    field,
    context,
    customTypeId,
    enqueueTypeDef,
    gatsbySchema,
  } = args

  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return 'String'

    case 'StructuredText':
      return 'PrismicStructuredTextType'

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
      return 'PrismicLinkType'

    case 'Group':
      const groupName = generateTypeName(`${customTypeId} ${id}`)
      const subfields = field.config.fields

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: groupName,
          fields: R.mapObjIndexed(
            (subfield, subfieldId) =>
              fieldToTypeName({ ...args, id: subfieldId, field: subfield }),
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
          `${customTypeId} ${sliceZoneId} ${id} Primary`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: primaryName,
            fields: R.mapObjIndexed(
              (primaryField, primaryFieldId) =>
                fieldToTypeName({
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
          `${customTypeId} ${sliceZoneId} ${id} Item`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: itemsName,
            fields: R.mapObjIndexed(
              (itemField, itemFieldId) =>
                fieldToTypeName({ ...args, id: itemFieldId, field: itemField }),
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
          fieldToTypeName({
            ...args,
            id: choiceId,
            field: choice,
            context: { sliceZoneId: id },
          }),
        ),
        R.values,
      )(field.config.choices)

      const slicesName = generateTypeName(`${customTypeId} ${id} Slices`)

      enqueueTypeDef(
        gatsbySchema.buildUnionType({
          name: slicesName,
          types: choiceTypes,
        }),
      )

      return `[${slicesName}]`

    default:
      console.log(`UNPROCESSED FIELD for type "${field.type}"`, id)
      return null
  }
}

export const generateTypeDefsForCustomType = (
  customTypeId,
  customTypeJson,
  gatsbySchema,
) => {
  const typeDefs = []
  const enqueueTypeDef = typeDef => typeDefs.push(typeDef)

  const { uid, ...dataFields } = R.pipe(
    R.values,
    R.mergeAll,
    R.mapObjIndexed((field, fieldId) =>
      fieldToTypeName({
        customTypeId,
        id: fieldId,
        field,
        context: {},
        enqueueTypeDef,
        gatsbySchema,
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

export const generateTypeDefsForLinkType = (allTypeDefs, gatsbySchema) => {
  const documentTypeNames = R.pipe(
    R.filter(
      R.pipe(
        R.pathOr([], ['config', 'interfaces']),
        R.contains('PrismicDocument'),
      ),
    ),
    R.map(R.path(['config', 'name'])),
  )(allTypeDefs)

  return [
    gatsbySchema.buildUnionType({
      name: 'PrismicAllDocumentTypes',
      types: documentTypeNames,
    }),
    gatsbySchema.buildObjectType({
      name: 'PrismicLinkType',
      fields: {
        id: 'String',
        // link_type: 'String',
        // url: String,
        // target: String,
        document: 'PrismicAllDocumentTypes',
      },
    }),
  ]
}

export const prismicTypeDefs = `
  type PrismicStructuredTextType {
    html: String
    text: String
  }

  type PrismicGeoPointType {
    latitude: Float
    longitude: Float
  }

  type PrismicEmbedType {
    author_name: String,
    author_url: String,
    cache_age: String,
    embed_url: String,
    html: String,
    name: String,
    provider_name: String,
    provider_url: String,
    thumbnail_height: Int,
    thumbnail_url: String,
    thumbnail_width: Int,
    title: String,
    type: String,
    version: String,
  }

  type PrismicImageDimensionsType {
    width: Int
    height: Int
  }

  type PrismicImageType {
    alt: String
    copyright: String
    dimensions: PrismicImageDimensionsType
    url: String
  }

  interface PrismicDocument {
    dataString: String
    first_publication_date: Date,
    href: String,
    id: ID!,
    lang: String,
    last_publication_date: Date,
    # tags: [String],
    type: String,
  }
`
