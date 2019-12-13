import * as R from 'ramda'
import pascalcase from 'pascalcase'
import { GraphQLScalarType } from 'gatsby/graphql'

// Returns a GraphQL type name given a field based on its type. If the type is
// is an object or union, the necessary type definition is enqueued on to the
// provided queue to be created at a later time.
const fieldToType = (id, value, depth, context) => {
  const {
    customTypeId,
    enqueueTypeDef,
    enqueueTypePath,
    gatsbyContext,
  } = context
  const { schema: gatsbySchema, createNodeId } = gatsbyContext

  switch (value.type) {
    case 'UID':
      enqueueTypePath([...depth, id], 'String')
      return {
        type: 'String',
        description:
          "The document's unique identifier. Unique among all instances of the document's type.",
      }

    case 'Color':
    case 'Select':
    case 'Text':
      enqueueTypePath([...depth, id], 'String')
      return 'String'

    case 'StructuredText':
      enqueueTypePath([...depth, id], 'PrismicStructuredTextType')
      return 'PrismicStructuredTextType'

    case 'Number':
      enqueueTypePath([...depth, id], 'Float')
      return 'Float'

    case 'Date':
    case 'Timestamp':
      enqueueTypePath([...depth, id], 'Date')
      return { type: 'Date', extensions: { dateformat: {} } }

    case 'GeoPoint':
      enqueueTypePath([...depth, id], 'PrismicGeoPointType')
      return 'PrismicGeoPointType'

    case 'Embed':
      enqueueTypePath([...depth, id], 'PrismicEmbedType')
      return 'PrismicEmbedType'

    case 'Image':
      enqueueTypePath([...depth, id], 'PrismicImageType')

      R.compose(
        R.forEach(thumb =>
          enqueueTypePath(
            [...depth, id, 'thumbnails', thumb.name],
            'PrismicImageThumbnailType',
          ),
        ),
        R.pathOr([], ['config', 'thumbnails']),
      )(value)

      return 'PrismicImageType'

    case 'Link':
      enqueueTypePath([...depth, id], 'PrismicLinkType')
      return 'PrismicLinkType'

    case 'Group':
      const groupName = pascalcase(`Prismic ${customTypeId} ${id} Group Type`)
      const subfields = value.config.fields

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: groupName,
          fields: R.mapObjIndexed(
            (subfield, subfieldId) =>
              fieldToType(subfieldId, subfield, [...depth, id], context),
            subfields,
          ),
          extensions: { infer: false },
        }),
      )

      enqueueTypePath([...depth, id], `[${groupName}]`)

      return `[${groupName}]`

    case 'Slice':
      const { sliceZoneId } = context
      const { 'non-repeat': primaryFields, repeat: itemsFields } = value

      const sliceFields = {
        id: 'String',
        slice_type: 'String',
      }

      if (primaryFields && !R.isEmpty(primaryFields)) {
        const primaryName = pascalcase(
          `Prismic ${customTypeId} ${sliceZoneId} ${id} Primary Type`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: primaryName,
            fields: R.mapObjIndexed(
              (primaryField, primaryFieldId) =>
                fieldToType(
                  primaryFieldId,
                  primaryField,
                  [...depth, id, 'primary'],
                  context,
                ),
              primaryFields,
            ),
            extensions: { infer: false },
          }),
        )

        enqueueTypePath([...depth, id, 'primary'], primaryName)

        sliceFields.primary = `${primaryName}`
      }

      if (itemsFields && !R.isEmpty(itemsFields)) {
        const itemName = pascalcase(
          `Prismic ${customTypeId} ${sliceZoneId} ${id} Item Type`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: itemName,
            fields: R.mapObjIndexed(
              (itemField, itemFieldId) =>
                fieldToType(
                  itemFieldId,
                  itemField,
                  [...depth, id, 'items'],
                  context,
                ),
              itemsFields,
            ),
            extensions: { infer: false },
          }),
        )

        enqueueTypePath([...depth, id, 'items'], `[${itemName}]`)

        sliceFields.items = `[${itemName}]`
      }

      const sliceName = pascalcase(
        `Prismic ${customTypeId} ${sliceZoneId} ${id}`,
      )

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: sliceName,
          fields: sliceFields,
          interfaces: ['Node'],
          extensions: { infer: false },
        }),
      )

      enqueueTypePath([...depth, id], sliceName)

      return sliceName

    case 'Slices':
      const choiceTypes = R.compose(
        R.values,
        R.mapObjIndexed((choice, choiceId) =>
          fieldToType(choiceId, choice, [...depth, id], {
            ...context,
            sliceZoneId: id,
          }),
        ),
      )(value.config.choices)

      const slicesName = pascalcase(`Prismic ${customTypeId} ${id} Slices Type`)

      enqueueTypeDef(
        gatsbySchema.buildUnionType({
          name: slicesName,
          types: choiceTypes,
        }),
      )

      enqueueTypePath([...depth, id], `[${slicesName}]`)

      return {
        type: `[${slicesName}]`,
        resolve: (parent, args, context, info) =>
          context.nodeModel.getNodesByIds({
            ids: parent[info.path.key],
          }),
      }

    // Note: AlternateLanguages is an internal plugin-specific type, not from
    // Prismic.
    case 'AlternateLanguages':
      // The types are intentionally different here. We need to handle
      // AlternateLanguages in a unique way in `common/documentToNodes.js`.
      enqueueTypePath([...depth, id], 'AlternateLanguages')
      return '[PrismicLinkType!]!'

    default:
      console.log(`UNPROCESSED FIELD for type "${value.type}"`, id)
      return null
  }
}

export const generateTypeDefsForCustomType = (id, json, context) => {
  const { gatsbyContext } = context
  const { schema: gatsbySchema } = gatsbyContext

  const typeDefs = []
  const enqueueTypeDef = typeDef => typeDefs.push(typeDef)

  const typePaths = []
  const enqueueTypePath = (path, type) => typePaths.push({ path, type })

  // UID fields are defined at the same level as data fields, but are a level
  // above data in API responses. Pulling it out separately here allows us to
  // process the UID field differently than the data fields.
  const { uid: uidField, ...dataFields } = R.compose(R.mergeAll, R.values)(json)

  // UID fields must be conditionally processed since not all custom types
  // implement a UID field.
  let uidFieldType
  if (uidField)
    uidFieldType = fieldToType('uid', uidField, [id], {
      ...context,
      customTypeId: id,
      enqueueTypePath,
    })

  // The alternate languages field acts as a list of Link fields. Note:
  // AlternateLanguages is an internal plugin-specific type, not from Prismic.
  const alternateLanguagesFieldType = fieldToType(
    'alternate_languages',
    { type: 'AlternateLanguages' },
    [id],
    {
      ...context,
      customTypeId: id,
      enqueueTypePath,
    },
  )

  // Create a type for all data fields by shallowly mapping each field to a
  // type.
  const dataName = pascalcase(`Prismic ${id} Data Type`)
  const dataFieldTypes = R.mapObjIndexed(
    (field, fieldId) =>
      fieldToType(fieldId, field, [id, 'data'], {
        ...context,
        customTypeId: id,
        enqueueTypeDef,
        enqueueTypePath,
      }),
    dataFields,
  )
  enqueueTypePath([id, 'data'], dataName)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: dataName,
      fields: dataFieldTypes,
      extensions: { infer: false },
    }),
  )

  const customTypeName = pascalcase(`Prismic ${id}`)
  const customTypeFields = {
    data: { type: dataName, description: "The document's data fields." },
    dataRaw: 'JSON!',
    dataString: 'String!',
    first_publication_date: {
      type: 'Date!',
      extensions: { dateformat: {} },
    },
    href: 'String!',
    url: 'String',
    id: 'ID!',
    lang: 'String!',
    last_publication_date: {
      type: 'Date!',
      extensions: { dateformat: {} },
    },
    tags: '[String!]!',
    alternate_languages: alternateLanguagesFieldType,
    type: 'String!',
    prismicId: 'ID!',
  }
  if (uidFieldType) customTypeFields.uid = uidFieldType

  enqueueTypePath([id], customTypeName)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: customTypeName,
      fields: customTypeFields,
      interfaces: ['PrismicDocument', 'Node'],
      extensions: { infer: false },
    }),
  )

  return { typeDefs, typePaths }
}

export const generateTypeDefForLinkType = (allTypeDefs, context) => {
  const { gatsbyContext } = context
  const { schema: gatsbySchema } = gatsbyContext

  const documentTypeNames = R.compose(
    R.map(R.path(['config', 'name'])),
    R.filter(
      R.compose(
        R.contains('PrismicDocument'),
        R.pathOr([], ['config', 'interfaces']),
      ),
    ),
  )(allTypeDefs)

  return gatsbySchema.buildUnionType({
    name: 'PrismicAllDocumentTypes',
    types: documentTypeNames,
  })
}

export const generateTypeDefsForImageType = (typePaths, context) => {
  const { gatsbyContext } = context
  const { schema: gatsbySchema } = gatsbyContext

  const thumbnailKeys = R.compose(
    R.map(R.compose(R.last, R.prop('path'))),
    R.filter(R.propEq('type', 'PrismicImageThumbnailType')),
  )(typePaths)

  if (thumbnailKeys.length < 1)
    return new GraphQLScalarType({
      name: 'PrismicImageThumbnailsType',
      serialize: () => null,
    })

  return gatsbySchema.buildObjectType({
    name: 'PrismicImageThumbnailsType',
    fields: R.reduce(
      (acc, curr) => R.assoc(curr, { type: 'PrismicImageThumbnailType' }, acc),
      {},
      thumbnailKeys,
    ),
    extensions: { infer: false },
  })
}
