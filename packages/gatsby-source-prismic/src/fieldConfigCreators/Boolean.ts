import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { createTypePath } from '../lib/createTypePath'

import { FieldConfigCreator, PrismicFieldType } from '../types'

export const createBooleanFieldConfig: FieldConfigCreator = (path) =>
  pipe(
    createTypePath(path, PrismicFieldType.Boolean),
    RTE.map(() => 'Boolean'),
  )
