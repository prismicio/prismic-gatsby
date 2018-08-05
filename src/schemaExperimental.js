import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import createNodeHelpers from 'gatsby-node-helpers'

const { generateTypeName } = createNodeHelpers({ typePrefix: 'Prismic' })

const parseField = type => {
  switch (type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID':
      return 'string'

    case 'StructuredText':
      return 'html'

    case 'Number':
      return 'float'

    case 'Date':
    case 'Timestamp':
      return 'datetime'

    case 'GeoPoint':
      return 'geopoint'

    case 'Embed':
      return 'embed'

    case 'Image':
      return 'image'

    case 'Link':
      return 'link'

    default:
      return `UNPROCESSED FIELD for type "${field.type}"`
  }
}

const normalizeFieldId = R.pipe(
  // Transform custom type name to GraphQL-aware name
  R.replace(
    /^my\.([a-z_]*)\./,
    R.pipe(
      R.nthArg(1),
      generateTypeName,
      R.concat(R.__, '.'),
    ),
  ),

  // Slice fields
  R.replace(/\.non-repeat\./, '.primary.'),
  R.replace(/\.repeat\./, '.items.'),

  // Remove UUID
  R.replace(/\$[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}\./, '.'),
)

export const parseSchema = R.pipe(
  RA.renameKeysWith(normalizeFieldId),
  R.map(
    R.pipe(
      R.head,
      parseField,
    ),
  ),
  R.toPairs,
  R.reduce((acc, [path, val]) => R.assocPath(R.split('.', path), val, acc), {}),
)
