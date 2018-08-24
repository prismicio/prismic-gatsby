import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const parseField = field => {
  switch (field.type) {
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

    case 'Group':
      return R.pipe(
        R.path(['config', 'fields']),
        R.map(parseField),
      )(field)

    case 'Slice':
      return R.pipe(
        R.pick(['non-repeat', 'repeat']),
        RA.renameKeys({ 'non-repeat': 'primary', repeat: 'items' }),
        R.map(R.map(parseField)),
      )(field)

    case 'Slices':
      return parseSchema(field.config)

    default:
      return `UNPROCESSED FIELD for type "${field.type}"`
  }
}


export const parseSchema = R.pipe(
  R.values,
  R.mergeAll,
  R.map(parseField),
)
