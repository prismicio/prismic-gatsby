import * as R from 'ramda'
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
} from 'gatsby/graphql'
import pascalcase from 'pascalcase'

const generateTypeName = (...parts) =>
  ['Prismic', ...parts.map(pascalcase)].join('')

const generatePrivateTypeName = (...parts) =>
  ['Prismic', ...parts.map(pascalcase)].join('__')

const GraphQLPrismicPrimitiveHTML = new GraphQLObjectType({
  name: generatePrivateTypeName('HTML'),
  fields: {
    html: { type: GraphQLString },
    text: { type: GraphQLString },
  },
})

const GraphQLPrismicPrimitiveGeoPoint = new GraphQLObjectType({
  name: generatePrivateTypeName('GeoPoint'),
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
  },
})

const GraphQLPrismicPrimitiveEmbed = new GraphQLObjectType({
  name: generatePrivateTypeName('Embed'),
  fields: {},
})

const GraphQLPrismicPrimitiveImage = new GraphQLObjectType({
  name: generatePrivateTypeName('Image'),
  fields: {},
})

const GraphQLPrismicPrimitiveLink = new GraphQLObjectType({
  name: generatePrivateTypeName('Link'),
  fields: {},
})

const fieldToGraphQLType = (customTypeId, options = {}) => (field, fieldId) => {
  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return { type: GraphQLString }

    case 'StructuredText':
      return { type: GraphQLPrismicPrimitiveHTML }

    case 'Number':
      return { type: GraphQLFloat }

    case 'Date':
    case 'Timestamp':
      return { type: GraphQLString }

    case 'GeoPoint':
      return { type: GraphQLPrismicPrimitiveGeoPoint }

    case 'Embed':
      return { type: GraphQLPrismicPrimitiveEmbed }

    case 'Image':
      return { type: GraphQLPrismicPrimitiveImage }

    case 'Link':
      return { type: GraphQLPrismicPrimitiveLink }

    case 'Group':
      return R.pipe(
        R.path(['config', 'fields']),
        subfields =>
          new GraphQLObjectType({
            name: generatePrivateTypeName('Group', fieldId),
            fields: R.map(fieldToGraphQLType(customTypeId), subfields),
          }),
        R.objOf('type'),
      )(field)

    case 'Slice':
      const { sliceZoneId } = options
      const { 'non-repeat': primaryFields, repeat: itemsFields } = field

      const primaryType = new GraphQLObjectType({
        name: generatePrivateTypeName(
          customTypeId,
          sliceZoneId,
          fieldId,
          'Primary',
        ),
        fields: R.map(fieldToGraphQLType(customTypeId), primaryFields),
      })

      const itemType = new GraphQLObjectType({
        name: generatePrivateTypeName(
          customTypeId,
          sliceZoneId,
          fieldId,
          'Item',
        ),
        fields: R.map(fieldToGraphQLType(customTypeId), itemsFields),
      })

      // GraphQL type must match source plugin type.
      const sliceType = new GraphQLObjectType({
        name: generateTypeName(customTypeId, sliceZoneId, fieldId),
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
        name: generatePrivateTypeName(customTypeId, fieldId, 'Slice'),
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
    name: generatePrivateTypeName(customTypeId, 'Data'),
    fields: dataFields,
  })

  // GraphQL type must match source plugin type.
  const queryType = new GraphQLObjectType({
    name: generateTypeName(customTypeId),
    fields: {
      uid,
      data: { type: dataType },
    },
  })

  return new GraphQLSchema({ query: queryType })
}
