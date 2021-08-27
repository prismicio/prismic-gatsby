import * as prismicT from '@prismicio/types'
import { IterableElement } from 'type-fest'

import {
  NormalizeConfig,
  NormalizedValueMap,
  NormalizerDependencies,
} from '../types'
import { normalize } from '../normalize'

export const isGroupField = (value: unknown): value is prismicT.GroupField => {
  return (
    Array.isArray(value) &&
    value.every((element) => typeof element === 'object' && element !== null)
  )
}

type NormalizeGroupConfig<Value extends prismicT.GroupField> =
  NormalizeConfig<Value> & NormalizerDependencies

export type NormalizedGroupValue<
  Value extends prismicT.GroupField = prismicT.GroupField,
> = NormalizedValueMap<IterableElement<Value>>[]

export const group = <Value extends prismicT.GroupField>(
  config: NormalizeGroupConfig<Value>,
): NormalizedGroupValue<Value> => {
  return config.value.map((element) => {
    const result: NormalizedValueMap<typeof element> = {}

    for (const key in element) {
      const transformedKey = config.transformFieldName(key)

      result[transformedKey] = normalize({
        ...config,
        value: element[key],
        path: [...config.path, transformedKey],
      })
    }

    return result
  }) as NormalizedGroupValue<Value>
}
