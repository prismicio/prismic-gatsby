import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const parseField = field => {
  switch (field.type) {
    case 'Select':
    case 'Text':
    case 'UID':
      return 'string'

    case 'StructuredText':
      return 'html'

    case 'Image':
      return 'image'

    case 'Link':
      return 'link'

    case 'Slice':
      return parseSliceField(field)

    case 'Slices':
      return parseSchema(field.config)

    default:
      return field
  }
}

const parseSliceField = R.pipe(
  R.pick(['non-repeat', 'repeat']),
  RA.renameKeys({ 'non-repeat': 'primary', repeat: 'items' }),
  R.map(R.map(parseField)),
)

export const parseSchema = R.pipe(
  R.values,
  R.mergeAll,
  R.map(parseField),
)
