import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createBooleanFieldConfig: FieldConfigCreator = () =>
  RTE.of('Boolean')
