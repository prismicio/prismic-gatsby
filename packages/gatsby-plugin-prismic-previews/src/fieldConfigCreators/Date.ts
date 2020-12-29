import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createDateFieldConfig: FieldConfigCreator = () =>
  RTE.of({
    type: 'Date',
    extensions: { dateformat: {} },
  })
