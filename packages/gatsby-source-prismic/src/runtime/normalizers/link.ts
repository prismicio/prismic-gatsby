import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'

import { PrismicDocumentNodeInput } from '../../types'

import { createGetProxy } from '../createGetProxy'

type LinkConfig<Value extends prismicT.LinkField> = {
  value: Value
  linkResolver?: prismicH.LinkResolverFunction
  getNode(id: string): PrismicDocumentNodeInput | undefined
}

type NormalizedLink<Value extends prismicT.LinkField> = Value & {
  url?: string | null
  raw: Value
  document: PrismicDocumentNodeInput | null
  localFile?: {
    publicURL: string
  }
}

export const link = <Value extends prismicT.LinkField>(
  config: LinkConfig<Value>,
): NormalizedLink<Value> => {
  const value: NormalizedLink<Value> = {
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
