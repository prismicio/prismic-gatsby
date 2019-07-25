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
}

export const validatePluginOptions = (pluginOptions, requireSchemas = true) => {
  const schema = yupObject().shape({
    ...baseValidations,
    schemas: requireSchemas ? baseValidations.schemas : undefined,
    typePathsFilenamePrefix: yupString()
      .nullable()
      .default(`prismic-typepaths---${pluginOptions.repositoryName}-`),
  })

  return schema.validate(pluginOptions, { abortEarly: false })
}
