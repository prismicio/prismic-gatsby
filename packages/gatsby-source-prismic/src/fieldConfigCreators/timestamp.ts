import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createTimestampFieldConfig: FieldConfigCreator = () =>
  RTE.of({
    type: 'Date',
    extensions: { dateformat: {} },
  })
