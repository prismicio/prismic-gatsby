import * as R from 'ramda'
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'gatsby/graphql'
import pascalcase from 'pascalcase'

const _generateTypeName = joinChar => (...parts) =>
  ['Prismic', ...parts.map(pascalcase)].join(joinChar)
const generatePublicTypeName = _generateTypeName('')
const generateNamespacedTypeName = _generateTypeName('__')

const GraphQLPrismicHTML = new GraphQLObjectType({
  name: generateNamespacedTypeName('HTML'),
  fields: {
    html: { type: GraphQLString },
    text: { type: GraphQLString },
  },
})

const GraphQLPrismicGeoPoint = new GraphQLObjectType({
  name: generateNamespacedTypeName('GeoPoint'),
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  },
})

// TODO: Implement embed fields. Fields are dynamic based on embed source.
// TODO: Convert to a union type for each embed source (e.g. GitHub, YouTube, etc.).
const GraphQLPrismicEmbed = new GraphQLObjectType({
  name: generateNamespacedTypeName('Embed'),
  fields: {},
})

const GraphQLPrismicImageDimensions = new GraphQLObjectType({
  name: generateNamespacedTypeName('Image', 'Dimensions'),
  fields: {
    width: { type: GraphQLInt },
    height: { type: GraphQLInt },
  },
})

const GraphQLPrismicImage = new GraphQLObjectType({
  name: generateNamespacedTypeName('Image'),
  fields: {
    alt: { type: GraphQLString },
    copyright: { type: GraphQLString },
    dimensions: { type: GraphQLPrismicImageDimensions },
    url: { type: GraphQLString },
  },
})

// TODO: Convert to a union type for each link_type (Document, Media, Web).
const GraphQLPrismicLink = new GraphQLObjectType({
  name: generateNamespacedTypeName('Link'),
  fields: {
    id: { type: GraphQLString },
    link_type: { type: GraphQLString },
  },
})

const fieldToGraphQLType = (customTypeId, options = {}) => (field, fieldId) => {
  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return { type: GraphQLString }

    case 'StructuredText':
      return { type: GraphQLPrismicHTML }

    case 'Number':
      return { type: GraphQLFloat }

    case 'Date':
    case 'Timestamp':
      return { type: GraphQLString }

    case 'GeoPoint':
      return { type: GraphQLPrismicGeoPoint }

    case 'Embed':
      return { type: GraphQLPrismicEmbed }

    case 'Image':
      return { type: GraphQLPrismicImage }

    case 'Link':
      return { type: GraphQLPrismicLink }

    case 'Group':
      return R.pipe(
        R.path(['config', 'fields']),
        subfields =>
          new GraphQLObjectType({
            name: generateNamespacedTypeName('Group', fieldId),
            fields: R.map(fieldToGraphQLType(customTypeId), subfields),
          }),
        R.objOf('type'),
      )(field)

    case 'Slice':
      const { sliceZoneId } = options
      const { 'non-repeat': primaryFields, repeat: itemsFields } = field

      const primaryType = new GraphQLObjectType({
        name: generateNamespacedTypeName(
          customTypeId,
          sliceZoneId,
          fieldId,
          'Primary',
        ),
        fields: R.map(fieldToGraphQLType(customTypeId), primaryFields),
      })

      const itemType = new GraphQLObjectType({
        name: generateNamespacedTypeName(
          customTypeId,
          sliceZoneId,
          fieldId,
          'Item',
        ),
        fields: R.map(fieldToGraphQLType(customTypeId), itemsFields),
      })

      // GraphQL type must match source plugin type.
      const sliceType = new GraphQLObjectType({
        name: generatePublicTypeName(customTypeId, sliceZoneId, fieldId),
        fields: {
          primary: { type: primaryType },
          items: { type: new GraphQLList(itemType) },
        },
      })

      return { type: sliceType }

    case 'Slices':
      const choiceTypes = R.pipe(
        R.path(['config', 'choices']),
        R.mapObjIndexed(
          fieldToGraphQLType(customTypeId, { sliceZoneId: fieldId }),
        ),
        R.values,
        R.map(R.prop('type')),
      )(field)

      const unionType = new GraphQLUnionType({
        name: generateNamespacedTypeName(customTypeId, fieldId, 'Slice'),
        types: choiceTypes,
      })

      return { type: new GraphQLList(unionType) }

    default:
      console.log(`UNPROCESSED FIELD for type "${field.type}"`)
      return {}
  }
}

export const customTypeJsonToGraphQLSchema = (customTypeId, json) => {
  const { uid, ...dataFields } = R.pipe(
    R.values,
    R.mergeAll,
    R.mapObjIndexed(fieldToGraphQLType(customTypeId)),
  )(json)

  const dataType = new GraphQLObjectType({
    name: generateNamespacedTypeName(customTypeId, 'Data'),
    fields: dataFields,
  })

  // GraphQL type must match source plugin type.
  const queryType = new GraphQLObjectType({
    name: generatePublicTypeName(customTypeId),
    fields: {
      uid,
      data: { type: dataType },
    },
  })

  return new GraphQLSchema({ query: queryType })
}
