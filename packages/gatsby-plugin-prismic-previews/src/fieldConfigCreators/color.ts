import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

export const createColorFieldConfig: FieldConfigCreator = () => RTE.of('String')
