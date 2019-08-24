import {
  array as yupArray,
  mixed as yupMixed,
  object as yupObject,
  string as yupString,
} from 'yup'

import { isFunction } from './utils'

const baseValidations = {
  repositoryName: yupString()
    .strict()
    .required(),
  accessToken: yupString()
    .strict()
    .required(),
  linkResolver: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => {}),
  fetchLinks: yupArray()
    .of(
      yupString()
        .strict()
        .required(),
    )
    .default([]),
  htmlSerializer: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => {}),
  schemas: yupObject()
    .strict()
    .required(),
  lang: yupString()
    .strict()
    .default('*'),
  shouldNormalizeImage: yupMixed()
    .test('is function', '${path} is not a function', isFunction)
    .default(() => () => true),
  plugins: yupArray()
    .max(0)
    .default([]),
  // Default value set in validatePluginOptions below.
  typePathsFilenamePrefix: yupString(),

  // Browser-only validations
  pathResolver: yupMixed().test(
    'is function',
    '${path} is not a function',
    x => typeof x === 'undefined' || isFunction(x),
  ),
  schemasDigest: yupString()
    .strict()
    .required(),
}

export const validatePluginOptions = (
  pluginOptions,
  filterValidations = {},
) => {
  // Must do this here with access to pluginOptions.
  if (pluginOptions.repositoryName)
    baseValidations.typePathsFilenamePrefix.default(
      `prismic-typepaths---${pluginOptions.repositoryName &&
        pluginOptions.repositoryName.toString()}-`,
    )
  else baseValidations.typePathsFilenamePrefix.default(`prismic-typepaths---`)

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
