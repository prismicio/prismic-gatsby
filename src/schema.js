import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLObjectType,
} from 'gatsby/graphql'
import pascalcase from 'pascalcase'

const generateTypeName = (...parts) =>
  ['Prismic', ...parts.map(pascalcase)].join('')

const PrismicHTMLType = new GraphQLObjectType({
  name: generateTypeName('HTMLType'),
  fields: {
    html: GraphQLString,
    text: GraphQLString,
  },
})

const PrismicGeoPointType = new GraphQLObjectType({
  name: generateTypeName('GeoPointType'),
  fields: {
    latitude: GraphQLFloat,
    longitude: GraphQLFloat,
  },
})

const PrismicEmbedType = new GraphQLObjectType({
  name: generateTypeName('EmbedType'),
  fields: {},
})

const PrismicImageType = new GraphQLObjectType({
  name: generateTypeName('ImageType'),
  fields: {},
})

const PrismicLinkType = new GraphQLObjectType({
  name: generateTypeName('LinkType'),
  fields: {},
})

const createPrismicSliceType = (typename, key, fields) =>
  new GraphQLObjectType({
    name: generateTypeName(typename, key),
    fields: parseSubSchema(fields),
  })

const parseField = typename => (field, key) => {
  switch (field.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return { type: GraphQLString }

    case 'StructuredText':
      return { type: PrismicHTMLType }

    case 'Number':
      return { type: GraphQLFloat }

    case 'Date':
    case 'Timestamp':
      return { type: GraphQLString }

    case 'GeoPoint':
      return { type: PrismicGeoPointType }

    case 'Embed':
      return { type: PrismicEmbedType }

    case 'Image':
      return { type: PrismicImageType }

    case 'Link':
      return { type: PrismicLinkType }

    case 'Group':
      return R.pipe(
        R.path(['config', 'fields']),
        subfields =>
          new GraphQLObjectType({
            name: `PrismicGroup${pascalcase(key)}Type`,
            fields: R.map(parseField(typename), subfields),
          }),
        x => ({ type: x }),
      )(field)

    // TODO: Add custom type namespace to type
    case 'Slice':
      return R.pipe(
        R.pick(['non-repeat', 'repeat']),
        RA.renameKeys({ 'non-repeat': 'primary', repeat: 'items' }),
        subfields =>
          new GraphQLObjectType({
            name: `Prismic${pascalcase(typename)}${pascalcase(key)}`,
            fields: R.map(R.map(parseField(typename)), subfields),
          }),
        x => ({ type: x }),
      )(field)

    // TODO: Should be an array of Slice types, not an object
    // TODO: Add custom type namespace to type
    case 'Slices':
      return {
        type: new GraphQLObjectType({
          name: `Prismic${pascalcase(typename)}${pascalcase(key)}__SliceZone`,
          fields: R.mapObjIndexed((val, sliceName) =>
            sliceToGraphQLType(typename, key, sliceName)(val),
          )(field.config.choices),
        }),
      }

    // TODO: Do not include in schema if unknown type
    default:
      return `UNPROCESSED FIELD for type "${field.type}"`
  }
}

const sliceToGraphQLType = (typename, key, sliceName) => fields => ({
  type: new GraphQLObjectType({
    name: generateTypeName(typename, key, sliceName),
    fields: parseSubSchema(typename)(fields),
  }),
})

const parseSubSchema = typename =>
  R.pipe(
    R.values,
    R.mergeAll,
    R.mapObjIndexed(parseField(typename)),
  )

export const customTypeJsonToGraphQLSchema = (typename, json) => {
  const { uid, ...dataFields } = parseSubSchema(typename)(json)

  const dataType = new GraphQLObjectType({
    name: generateTypeName(typename, 'Data'),
    fields: dataFields,
  })

  const queryType = new GraphQLObjectType({
    name: generateTypeName(typename),
    fields: {
      uid,
      data: { type: dataType },
    },
  })

  return new GraphQLSchema({ query: queryType })
}
