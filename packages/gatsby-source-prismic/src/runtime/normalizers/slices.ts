import * as prismicT from '@prismicio/types'
import { IterableElement, Simplify } from 'type-fest'

import {
  NormalizeConfig,
  NormalizedValue,
  NormalizerDependencies,
} from '../types'
import { normalize } from '../normalize'
import { isSharedSlice, isSlice } from './slice'

export const isSlices = (value: unknown): value is prismicT.SliceZone => {
  return Array.isArray(value) && value.every((element) => isSlice(element))
}

type NormalizeSlicesConfig<
  Value extends prismicT.SliceZone
> = NormalizeConfig<Value> & NormalizerDependencies

export type NormalizedSlicesValue<
  Value extends prismicT.SliceZone = prismicT.SliceZone
> = NormalizedValue<Simplify<IterableElement<Value>>>[]

export const slices = <Value extends prismicT.SliceZone>(
  config: NormalizeSlicesConfig<Value>,
): NormalizedSlicesValue<Value> => {
  return config.value.map((element) => {
    return normalize({
      ...config,
      value: element,
      path: isSharedSlice(element)
        ? [element.slice_type, element.variation]
        : [...config.path, element.slice_type],
    })
  }) as NormalizedSlicesValue<Value>
}
