// Returns true if the field value appears to be a Rich Text field, false
// otherwise.
export const isRichTextField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  Object.keys(value[0]).includes('spans')

// Returns true if the field value appears to be a Link field, false otherwise.
export const isLinkField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('link_type')

// Returns true if the field value appears to be an Image field, false
// otherwise.
export const isImageField = value =>
  value !== null &&
  typeof value === 'object' &&
  value.hasOwnProperty('url') &&
  value.hasOwnProperty('dimensions') &&
  value.hasOwnProperty('alt') &&
  value.hasOwnProperty('copyright')

// Returns true if the key and value appear to be from a slice zone field,
// false otherwise.
export const isSliceField = value =>
  Array.isArray(value) &&
  typeof value[0] === 'object' &&
  value[0].hasOwnProperty('slice_type') &&
  (value[0].hasOwnProperty('primary') || value[0].hasOwnProperty('items'))

// Returns true if the field value appears to be a group field, false
// otherwise.
// NOTE: This check must be performed after isRichTextField and isSliceField.
export const isGroupField = value =>
  Array.isArray(value) && typeof value[0] === 'object'
