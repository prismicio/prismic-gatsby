import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import { PrismicFieldSchema } from '../types'
import { PrismicSliceSchemaD } from './PrismicSliceSchemaD'

export const PrismicFieldSchemaD: D.Decoder<
  unknown,
  PrismicFieldSchema
> = D.lazy('PrismicFieldSchema', () =>
  D.union(
    D.type({
      type: D.union(
        D.literal('Boolean'),
        D.literal('Color'),
        D.literal('Date'),
        D.literal('Embed'),
        D.literal('GeoPoint'),
        D.literal('Image'),
        D.literal('Link'),
        D.literal('Number'),
        D.literal('Select'),
        D.literal('StructuredText'),
        D.literal('Text'),
        D.literal('Timestamp'),
        D.literal('UID'),
      ),
      config: D.partial({
        label: D.string,
        placeholder: D.string,
      }),
    }),
    D.type({
      type: D.literal('Group'),
      config: pipe(
        D.type({
          fields: D.record(PrismicFieldSchemaD),
        }),
        D.intersect(
          D.partial({
            label: D.string,
            placeholder: D.string,
          }),
        ),
      ),
    }),
    D.type({
      type: D.literal('Slices'),
      config: pipe(
        D.type({
          choices: D.record(PrismicSliceSchemaD),
        }),
        D.intersect(
          D.partial({
            labels: D.record(D.array(D.string)),
          }),
        ),
      ),
    }),
  ),
)
