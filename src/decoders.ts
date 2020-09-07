import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from './constants'
import { UnknownRecord, PrismicFieldSchema } from './types'
import * as d from './lib/decoders'

export const PrismicFieldTypeC = D.union(
  D.literal('Boolean'),
  D.literal('Color'),
  D.literal('Date'),
  D.literal('Embed'),
  D.literal('Float'),
  D.literal('GeoPoint'),
  D.literal('Group'),
  D.literal('Image'),
  D.literal('Link'),
  D.literal('Number'),
  D.literal('Select'),
  D.literal('Slice'),
  D.literal('Slices'),
  D.literal('StructuredText'),
  D.literal('Text'),
  D.literal('Timestamp'),
  D.literal('UID'),
)

export const PrismicSliceSchemaC = D.lazy('PrismicSliceSchemaC', () =>
  pipe(
    D.type({
      type: D.literal('Slice'),
      'non-repeat': D.record(PrismicFieldSchemaC),
      repeat: D.record(PrismicFieldSchemaC),
    }),
  ),
)

export const PrismicFieldSchemaC: D.Decoder<
  unknown,
  PrismicFieldSchema
> = D.lazy('PrismicFieldSchema', () =>
  D.type({
    type: PrismicFieldTypeC,
    config: D.partial({
      label: D.string,
      placeholder: D.string,
      fields: D.record(PrismicFieldSchemaC),
      labels: D.record(D.array(D.string)),
      choices: D.record(PrismicSliceSchemaC),
    }),
  }),
)

export const PrismicTabSchemaC = D.record(PrismicFieldSchemaC)

export const PrismicSchemaC = D.record(PrismicTabSchemaC)

export const PluginOptionsC = pipe(
  D.type({
    repositoryName: D.string,
    schemas: D.record(PrismicSchemaC),
    imageImgixParams: pipe(
      D.UnknownRecord,
      d.withFallback(DEFAULT_IMGIX_PARAMS as UnknownRecord),
    ),
    imagePlaceholderImgixParams: pipe(
      D.UnknownRecord,
      d.withFallback(DEFAULT_PLACEHOLDER_IMGIX_PARAMS as UnknownRecord),
    ),
  }),
  D.intersect(
    D.partial({
      accessToken: D.string,
      releaseID: D.string,
      linkResolver: d.func,
      htmlSerializer: d.func,
      lang: D.string,
      prismicToolbar: D.union(D.boolean, D.literal('legacy')),
      shouldDownloadImage: d.func,
      typePrefix: D.string,
    }),
  ),
)
