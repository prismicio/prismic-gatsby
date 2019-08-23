import {
  array as yupArray,
  mixed as yupMixed,
  object as yupObject,
  string as yupString,
} from 'yup'

import { isFunction } from './utils'

const baseValidations = {
  repositoryName: yupString()
    .nullable()
    .required(),
  accessToken: yupString()
    .nullable()
    .required(),
  linkResolver: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => {}),
  fetchLinks: yupArray()
    .of(yupString().required())
    .default([]),
  htmlSerializer: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => {}),
  schemas: yupObject()
    .nullable()
    .required(),
  lang: yupString()
    .nullable()
    .default('*'),
  shouldNormalizeImage: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => true),
  plugins: yupArray()
    .max(0)
    .default([]),

  // Browser-only validations
  pathResolver: yupMixed()
    .nullable()
    .test(
      'is function',
      '${path} is not a function',
      value => value === undefined || isFunction(value),
    ),
  schemasDigest: yupString()
    .nullable()
    .required('Invalid Schemas digest.'),
}

export const validatePluginOptions = (
  pluginOptions,
  filterValidations = {},
) => {
  // Add typePathsFilenamePrefix. The default is derived from the provided
  // pluginOptions.
  baseValidations.typePathsFilenamePrefix = yupString()
    .nullable()
    .default(`prismic-typepaths---${pluginOptions.repositoryName}-`)

  // Filter validations based on the filterValidations param.
  const filteredValidations = Object.keys(baseValidations).reduce(
    (acc, key) => {
      if (filterValidations[key] || !filterValidations.hasOwnProperty(key))
        acc[key] = baseValidations[key]
      return acc
    },
    {},
  )

  const schema = yupObject().shape(filteredValidations)

  return schema.validateSync(pluginOptions, { abortEarly: false })
}
