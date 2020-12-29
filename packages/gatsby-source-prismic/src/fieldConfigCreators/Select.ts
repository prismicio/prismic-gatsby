import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

// TODO: Create an enum type
export const createSelectFieldConfig: FieldConfigCreator = () =>
  RTE.of('String')
