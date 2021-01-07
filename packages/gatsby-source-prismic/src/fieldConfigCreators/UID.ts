import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createUIDFieldConfig: FieldConfigCreator = () => RTE.of('String!')
