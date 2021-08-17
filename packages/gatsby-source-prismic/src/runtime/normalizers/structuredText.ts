import * as prismicH from '@prismicio/helpers'

import {
  NormalizeConfig,
  NormalizerDependencies,
  StructuredTextField,
} from '../types'

export const isStructuredTextField = (
  value: unknown,
): value is StructuredTextField => {
  // We must be very loose here. An image element, for example, does not
  // contain a `text` property.
  return Array.isArray(value) && value.every((element) => 'type' in element)
}

export type NormalizeStructuredTextConfig<
  Value extends StructuredTextField = StructuredTextField,
> = NormalizeConfig<Value> &
  Pick<NormalizerDependencies, 'linkResolver' | 'htmlSerializer'>

export type NormalizedStructuredTextValue<Value extends StructuredTextField> = {
  html: string
  text: string
  richText: Value
  raw: Value
}

export const structuredText = <Value extends StructuredTextField>(
  config: NormalizeStructuredTextConfig<Value>,
): NormalizedStructuredTextValue<Value> => {
  return {
    html: prismicH.asHTML(
      config.value,
      config.linkResolver,
      config.htmlSerializer,
    ),
    text: prismicH.asText(config.value),
    richText: config.value,
    raw: config.value,
  }
}
