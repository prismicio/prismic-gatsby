import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import { PrismicFieldSchemaD } from './PrismicFieldSchemaD'

export const PrismicSliceSchemaD = D.lazy('PrismicSliceSchemaC', () =>
  pipe(
    D.type({
      type: D.literal('Slice'),
      'non-repeat': D.record(PrismicFieldSchemaD),
      repeat: D.record(PrismicFieldSchemaD),
    }),
  ),
)
