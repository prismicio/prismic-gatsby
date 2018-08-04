import R from 'ramda'

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
      return parseSlice(field)

    case 'Slices':
      return parseSchema(field.config)

    default: return field
  }
}

const parseSlice = field => ({
  primary: R.pipe(
    R.path(['non-repeat']),
    R.map(parseField),
  )(field),
  items: R.pipe(
    R.path(['repeat']),
    R.map(parseField)
  )(field)
})

export const parseSchema = R.pipe(
  R.values,
  R.mergeAll,
  R.map(parseField),
)
