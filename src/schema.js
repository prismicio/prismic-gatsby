import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { GraphQLString, GraphQLFloat, GraphQLObjectType } from 'gatsby/graphql'
import pascalcase from 'pascalcase'

const parseField = (field, key) => {
  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return GraphQLString

    case 'StructuredText':
      return new GraphQLObjectType({
        name: 'PrismicHTMLType',
        fields: {
          html: GraphQLString,
          text: GraphQLString,
        },
      })

    case 'Number':
      return GraphQLFloat

    case 'Date':
    case 'Timestamp':
      return GraphQLString

    case 'GeoPoint':
      return new GraphQLObjectType({
        name: 'PrismicGeoPointType',
        fields: {
          latitude: GraphQLFloat,
          longitude: GraphQLFloat,
        },
      })

    case 'Embed':
      return new GraphQLObjectType({
        name: 'PrismicEmbedType',
        fields: {},
      })

    case 'Image':
      return new GraphQLObjectType({
        name: 'PrismicImageType',
        fields: {},
      })

    case 'Link':
      return new GraphQLObjectType({
        name: 'PrismicLinkType',
        fields: {},
      })

    case 'Group':
      return R.pipe(
        R.path(['config', 'fields']),
        subfields =>
          new GraphQLObjectType({
            name: `PrismicGroup${pascalcase(key)}Type`,
            fields: R.map(parseField, subfields),
          }),
      )(field)

    // TODO: Add custom type namespace to type
    case 'Slice':
      return R.pipe(
        R.pick(['non-repeat', 'repeat']),
        RA.renameKeys({ 'non-repeat': 'primary', repeat: 'items' }),
        subfields =>
          new GraphQLObjectType({
            name: `PrismicSlice${pascalcase(
              key,
            )}Type__NEEDS_CUSTOM_TYPE_NAMESPACE`,
            fields: R.map(R.map(parseField), subfields),
          }),
      )(field)

    // TODO: Should be an array of Slice types, not an object
    // TODO: Add custom type namespace to type
    case 'Slices':
      return new GraphQLObjectType({
        name: `PrismicSliceZone${pascalcase(key)}__NEEDS_CUSTOM_TYPE_NAMESPACE`,
        fields: parseSubSchema(field.config),
      })

    // TODO: Do not include in schema if unknown type
    default:
      return `UNPROCESSED FIELD for type "${field.type}"`
  }
}

const parseSubSchema = R.pipe(
  R.values,
  R.mergeAll,
  R.mapObjIndexed(parseField),
)

export const parseSchema = R.pipe(
  parseSubSchema,
  ({ uid, ...rest }) => ({ uid, data: rest }),
)
