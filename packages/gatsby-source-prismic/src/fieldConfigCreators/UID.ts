import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

// TODO: Convert to non-nullable type
export const createUIDFieldConfig: FieldConfigCreator = () => RTE.of('String')
