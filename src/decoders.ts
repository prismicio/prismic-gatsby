import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import {
  DEFAULT_FETCH_LINKS,
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from './constants'
import { UnknownRecord, PrismicFieldSchema } from './types'
import * as d from './lib/decoders'

export const PrismicFieldTypeD = D.union(
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

export const PrismicSliceSchemaD = D.lazy('PrismicSliceSchemaC', () =>
  pipe(
    D.type({
      type: D.literal('Slice'),
      'non-repeat': D.record(PrismicFieldSchemaD),
      repeat: D.record(PrismicFieldSchemaD),
    }),
  ),
)

export const PrismicFieldSchemaD: D.Decoder<
  unknown,
  PrismicFieldSchema
> = D.lazy('PrismicFieldSchema', () =>
  D.type({
    type: PrismicFieldTypeD,
    config: D.partial({
      label: D.string,
      placeholder: D.string,
      fields: D.record(PrismicFieldSchemaD),
      labels: D.record(D.array(D.string)),
      choices: D.record(PrismicSliceSchemaD),
    }),
  }),
)

export const PrismicTabSchemaD = D.record(PrismicFieldSchemaD)

export const PrismicSchemaD = D.record(PrismicTabSchemaD)

export const PluginOptionsD = pipe(
  D.type({
    repositoryName: D.string,
    schemas: D.record(PrismicSchemaD),
    fetchLinks: pipe(D.array(D.string), d.withFallback(DEFAULT_FETCH_LINKS)),
    lang: pipe(D.string, d.withFallback(DEFAULT_LANG)),
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
      apiEndpoint: D.string,
      releaseID: D.string,
      linkResolver: d.func,
      htmlSerializer: d.func,
      prismicToolbar: D.union(D.boolean, D.literal('legacy')),
      shouldDownloadImage: d.func,
      typePrefix: D.string,
    }),
  ),
)
