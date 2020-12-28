import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createSelectFieldConfig: FieldConfigCreator = () =>
  RTE.of('String')
