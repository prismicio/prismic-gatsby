import * as D from 'io-ts/Decoder'

import { PrismicTabSchemaD } from './PrismicTabSchemaD'

export const PrismicSchemaD = D.record(PrismicTabSchemaD)
