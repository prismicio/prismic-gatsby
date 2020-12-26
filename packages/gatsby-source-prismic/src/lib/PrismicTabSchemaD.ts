import * as D from 'io-ts/Decoder'

import { PrismicFieldSchemaD } from './PrismicFieldSchemaD'

export const PrismicTabSchemaD = D.record(PrismicFieldSchemaD)
