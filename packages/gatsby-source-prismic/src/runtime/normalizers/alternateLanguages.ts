import * as prismicT from '@prismicio/types'
import { IterableElement } from 'type-fest'

import { PrismicDocumentNodeInput } from '../../types'
import { createGetProxy } from '../createGetProxy'

type AlternateLanguagesConfig = {
  value: prismicT.PrismicDocument['alternate_languages']
  getNode(id: string): PrismicDocumentNodeInput | undefined
}

type NormalizedAlternateLanguages = (IterableElement<
  prismicT.PrismicDocument['alternate_languages']
> & {
  document: PrismicDocumentNodeInput | null
  raw: IterableElement<prismicT.PrismicDocument['alternate_languages']>
})[]

export const alternateLanguages = (
  config: AlternateLanguagesConfig,
): NormalizedAlternateLanguages => {
  return config.value.map((alternateLanguage) => {
    const value = {
      ...alternateLanguage,
      document: null,
      raw: alternateLanguage,
    }

    return createGetProxy(value, (target, prop, receiver) => {
      if (prop === 'document') {
        return config.getNode(value.id) || null
      }

      return Reflect.get(target, prop, receiver)
    })
  })
}
