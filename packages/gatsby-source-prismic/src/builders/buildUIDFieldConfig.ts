import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const buildUIDFieldConfig: FieldConfigCreator = () => RTE.right('String!')
