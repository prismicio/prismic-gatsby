import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'

import { PrismicDocumentNodeInput } from '../../types'

import { createGetProxy } from '../createGetProxy'
import { NormalizeConfig, NormalizerDependencies } from '../types'

export const isLinkField = (value: unknown): value is prismicT.LinkField => {
  return typeof value === 'object' && (value === null || 'link_type' in value)
}

export type NormalizeLinkConfig<
  Value extends prismicT.LinkField = prismicT.LinkField,
> = NormalizeConfig<Value> &
  Pick<NormalizerDependencies, 'linkResolver' | 'getNode'>

export type NormalizedLinkValue<Value extends prismicT.LinkField> = Value & {
  url?: string | null
  raw: Value
  document: PrismicDocumentNodeInput | null
  localFile?: {
    publicURL: string
  }
}

export const link = <Value extends prismicT.LinkField>(
  config: NormalizeLinkConfig<Value>,
): NormalizedLinkValue<Value> => {
  const value: NormalizedLinkValue<Value> = {
    ...config.value,
    url: prismicH.asLink(config.value, config.linkResolver),
    document: null,
    localFile: undefined,
    raw: config.value,
  }

  if (
    config.value.link_type === prismicT.LinkType.Media &&
    'url' in config.value
  ) {
    value.localFile = {
      publicURL: config.value.url,
    }
  }

  return createGetProxy(value, (target, prop, receiver) => {
    if (
      prop === 'document' &&
      config.value.link_type === prismicT.LinkType.Document &&
      'id' in config.value &&
      !config.value.isBroken
    ) {
      return config.getNode(config.value.id) || null
    }

    return Reflect.get(target, prop, receiver)
  })
}
