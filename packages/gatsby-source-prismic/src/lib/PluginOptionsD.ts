import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import {
  DEFAULT_FETCH_LINKS,
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../constants'
import { UnknownRecord } from '../types'
import * as d from './decoders'
import { PrismicSchemaD } from './PrismicSchemaD'

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
    plugins: pipe(
      D.array(D.UnknownRecord),
      d.withFallback([] as UnknownRecord[]),
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
      webhookSecret: D.string,
    }),
  ),
)
