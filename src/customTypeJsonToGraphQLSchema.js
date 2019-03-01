import * as R from 'ramda'
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'gatsby/graphql'
import pascalcase from 'pascalcase'

const _generateTypeName = joinChar => (...parts) =>
  ['Prismic', ...parts.map(pascalcase)].join(joinChar)
const generatePublicTypeName = _generateTypeName('')
const generateNamespacedTypeName = _generateTypeName('__')

// Provides the ability to control the return value of Date fields on the
// mocked node. This is required to ensure Gatsby processes the field as a Date
// to provide date arguments like `formatString`.
const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  serialize: R.identity,
})

// Provides the ability to control the return value of ImageURL fields on the
// mocked node. This is required to allow setting the image URL when creating
// mock localFile fields.
const GraphQLImageURL = new GraphQLScalarType({
  name: 'ImageURL',
  serialize: R.identity,
})

const GraphQLPrismicHTML = new GraphQLObjectType({
  name: generateNamespacedTypeName('HTML'),
  fields: {
    html: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
})

const GraphQLPrismicGeoPoint = new GraphQLObjectType({
  name: generateNamespacedTypeName('GeoPoint'),
  fields: {
    latitude: { type: new GraphQLNonNull(GraphQLFloat) },
    longitude: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

const GraphQLPrismicEmbed = new GraphQLObjectType({
  name: generateNamespacedTypeName('Embed'),
  fields: {
    author_name: { type: new GraphQLNonNull(GraphQLString) },
    author_url: { type: new GraphQLNonNull(GraphQLString) },
    cache_age: { type: new GraphQLNonNull(GraphQLString) },
    embed_url: { type: new GraphQLNonNull(GraphQLString) },
    html: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    provider_name: { type: new GraphQLNonNull(GraphQLString) },
    provider_url: { type: new GraphQLNonNull(GraphQLString) },
    thumbnail_height: { type: new GraphQLNonNull(GraphQLString) },
    thumbnail_url: { type: new GraphQLNonNull(GraphQLString) },
    thumbnail_width: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    version: { type: new GraphQLNonNull(GraphQLString) },
  },
})

const GraphQLPrismicImageDimensions = new GraphQLObjectType({
  name: generateNamespacedTypeName('Image', 'Dimensions'),
  fields: {
    width: { type: new GraphQLNonNull(GraphQLInt) },
    height: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

const GraphQLPrismicImage = new GraphQLObjectType({
  name: generateNamespacedTypeName('Image'),
  fields: {
    alt: { type: new GraphQLNonNull(GraphQLString) },
    copyright: { type: new GraphQLNonNull(GraphQLString) },
    dimensions: { type: GraphQLPrismicImageDimensions },
    url: { type: GraphQLImageURL },
  },
})

const GraphQLPrismicLink = new GraphQLObjectType({
  name: generateNamespacedTypeName('Link'),
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    link_type: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: new GraphQLNonNull(GraphQLString) },
    target: { type: new GraphQLNonNull(GraphQLString) },
  },
})

// Returns a GraphQL type for a given schema field.
const fieldToGraphQLType = (customTypeId, options = {}) => (field, fieldId) => {
  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return { type: new GraphQLNonNull(GraphQLString) }

    case 'StructuredText':
      return { type: GraphQLPrismicHTML }

    case 'Number':
      return { type: new GraphQLNonNull(GraphQLFloat) }

    case 'Date':
    case 'Timestamp':
      return { type: new GraphQLNonNull(GraphQLDate) }

    case 'GeoPoint':
      return { type: GraphQLPrismicGeoPoint }

    case 'Embed':
      return { type: GraphQLPrismicEmbed }

    case 'Image':
      return { type: GraphQLPrismicImage }

    case 'Link':
      return { type: GraphQLPrismicLink }

    case 'Group':
      const group = R.pipe(
        R.path(['config', 'fields']),
        subfields =>
          new GraphQLObjectType({
            name: generateNamespacedTypeName('Group', fieldId),
            fields: R.map(fieldToGraphQLType(customTypeId), subfields),
          }),
      )(field)

      return { type: new GraphQLList(group) }

    case 'Slice':
      const { sliceZoneId } = options
      const { 'non-repeat': primaryFields, repeat: itemsFields } = field

      const sliceFields = {
        id: { type: new GraphQLNonNull(GraphQLString) },
        slice_type: { type: new GraphQLNonNull(GraphQLString) },
      }

      if (!R.isEmpty(primaryFields))
        sliceFields.primary = {
          type: new GraphQLObjectType({
            name: generateNamespacedTypeName(
              customTypeId,
              sliceZoneId,
              fieldId,
              'Primary',
            ),
            fields: R.map(fieldToGraphQLType(customTypeId), primaryFields),
          }),
        }

      if (!R.isEmpty(itemsFields))
        sliceFields.items = {
          type: new GraphQLList(
            new GraphQLObjectType({
              name: generateNamespacedTypeName(
                customTypeId,
                sliceZoneId,
                fieldId,
                'Item',
              ),
              fields: R.map(fieldToGraphQLType(customTypeId), itemsFields),
            }),
          ),
        }

      // GraphQL type must match source plugin type.
      const sliceType = new GraphQLObjectType({
        name: generatePublicTypeName(customTypeId, sliceZoneId, fieldId),
        fields: sliceFields,
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

// Returns a GraphQL schema generated from a custom type JSON schema.
export const customTypeJsonToGraphQLSchema = (customTypeId, json) => {
  const { uid, ...dataFields } = R.pipe(
    R.values,
    R.mergeAll,
    R.mapObjIndexed(fieldToGraphQLType(customTypeId)),
  )(json)

  const fields = {
    dataString: { type: new GraphQLNonNull(GraphQLString) },
    first_publication_date: { type: new GraphQLNonNull(GraphQLDate) },
    href: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLString) },
    lang: { type: new GraphQLNonNull(GraphQLString) },
    last_publication_date: { type: new GraphQLNonNull(GraphQLDate) },
    tags: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    tags: { type: new GraphQLList(new GraphQLNonNull(GraphQLString)) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    data: {
      type: new GraphQLObjectType({
        name: generateNamespacedTypeName(customTypeId, 'Data'),
        fields: dataFields,
      }),
    },
  }

  if (uid) fields.uid = uid

  // GraphQL type must match source plugin type.
  const queryType = new GraphQLObjectType({
    name: generatePublicTypeName(customTypeId),
    fields,
  })

  return new GraphQLSchema({ query: queryType })
}
