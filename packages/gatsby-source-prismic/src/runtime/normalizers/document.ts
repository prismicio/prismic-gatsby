import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'

import {
  NormalizeConfig,
  NormalizedValueMap,
  NormalizerDependencies,
} from '../types'
import { normalize } from '../normalize'
import { alternateLanguages } from './alternateLanguages'

export const isDocument = (
  value: unknown,
): value is prismicT.PrismicDocument => {
  return typeof value === 'object' && value !== null && 'type' in value
}

type NormalizeDocumentConfig<Value extends prismicT.PrismicDocument> =
  NormalizeConfig<Value> & NormalizerDependencies

export type NormalizedDocumentValue<
  Value extends prismicT.PrismicDocument = prismicT.PrismicDocument,
> = Omit<Value, 'data'> & {
  data: NormalizedValueMap<Value['data']>
}

export const document = <Value extends prismicT.PrismicDocument>(
  config: NormalizeDocumentConfig<Value>,
): NormalizedDocumentValue<Value> => {
  return {
    ...config.value,
    __typename: config.nodeHelpers.createTypeName(config.path),
    _previewable: config.value.id,
    alternate_languages: alternateLanguages({
      ...config,
      value: config.value['alternate_languages'],
    }),
    url: prismicH.documentAsLink(config.value, config.linkResolver),
    data: normalize({
      ...config,
      value: config.value.data,
      path: [...config.path, 'data'],
    }),
  } as NormalizedDocumentValue<Value>
}
