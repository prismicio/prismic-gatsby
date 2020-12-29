import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createTextFieldConfig: FieldConfigCreator = () => RTE.of('String')
