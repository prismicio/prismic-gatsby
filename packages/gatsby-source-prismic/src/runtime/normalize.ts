import * as prismicT from '@prismicio/types'

import { PrismicSpecialType } from '../types'

import * as normalizers from './normalizers'
import {
  NormalizedValue,
  StructuredTextField,
  NormalizeConfig as BaseNormalizeConfig,
  NormalizerDependencies,
} from './types'

function assertType<T>(
  type:
    | prismicT.CustomTypeModelFieldType
    | prismicT.CustomTypeModelSliceType
    | PrismicSpecialType,
  guard: (value: unknown) => boolean,
  value: unknown,
): asserts value is T {
  if (!guard(value)) {
    throw new Error(`Value is not expected type ${type}`)
  }
}

type NormalizeConfig<Value> = BaseNormalizeConfig<Value> &
  NormalizerDependencies

export const normalize = <Value>(
  config: NormalizeConfig<Value>,
): NormalizedValue<Value> => {
  const type = config.getTypePath(config.path)
  if (!type) {
    throw new Error(
      `No type for path: ${config.path.join(
        '.',
      )}. Did you register the Custom Type model?`,
    )
  }

  switch (type.type) {
    case PrismicSpecialType.Document: {
      assertType<prismicT.PrismicDocument>(
        PrismicSpecialType.Document,
        normalizers.isDocument,
        config.value,
      )

      return normalizers.document({
        ...config,
        value: config.value,
      }) as NormalizedValue<Value>
    }

    case PrismicSpecialType.DocumentData: {
      assertType<prismicT.PrismicDocument['data']>(
        PrismicSpecialType.DocumentData,
        normalizers.isDocumentDataField,
        config.value,
      )

      return normalizers.documentData({
        ...config,
        value: config.value,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelFieldType.Group: {
      assertType<prismicT.GroupField>(
        prismicT.CustomTypeModelFieldType.Group,
        normalizers.isGroupField,
        config.value,
      )

      return normalizers.group({
        ...config,
        value: config.value,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelFieldType.Slices: {
      assertType<prismicT.SliceZone>(
        prismicT.CustomTypeModelFieldType.Slices,
        normalizers.isSlices,
        config.value,
      )

      return normalizers.slices({
        ...config,
        value: config.value,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelSliceType.Slice:
    case PrismicSpecialType.SharedSliceVariation: {
      assertType<prismicT.Slice | prismicT.SharedSlice>(
        prismicT.CustomTypeModelSliceType.Slice,
        normalizers.isSlice,
        config.value,
      )

      return normalizers.slice({
        ...config,
        value: config.value,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelFieldType.Link: {
      assertType<prismicT.LinkField>(
        prismicT.CustomTypeModelFieldType.Link,
        normalizers.isLinkField,
        config.value,
      )

      return normalizers.link({
        value: config.value,
        path: config.path,
        getNode: config.getNode,
        linkResolver: config.linkResolver,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelFieldType.Image: {
      assertType<prismicT.ImageField>(
        prismicT.CustomTypeModelFieldType.Image,
        normalizers.isImageField,
        config.value,
      )

      return normalizers.image({
        value: config.value,
        path: config.path,
        imageImgixParams: config.imageImgixParams,
        imagePlaceholderImgixParams: config.imagePlaceholderImgixParams,
      }) as NormalizedValue<Value>
    }

    case prismicT.CustomTypeModelFieldType.StructuredText: {
      assertType<StructuredTextField>(
        prismicT.CustomTypeModelFieldType.StructuredText,
        normalizers.isStructuredTextField,
        config.value,
      )

      return normalizers.structuredText({
        value: config.value,
        path: config.path,
        linkResolver: config.linkResolver,
        htmlSerializer: config.htmlSerializer,
      }) as NormalizedValue<Value>
    }

    default: {
      return config.value as NormalizedValue<Value>
    }
  }
}
