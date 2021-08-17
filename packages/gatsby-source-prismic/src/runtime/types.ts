import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'
import * as imgixGatsby from '@imgix/gatsby'
import * as gatsby from 'gatsby'
import * as nodeHelpers from 'gatsby-node-helpers'

import { TypePath } from '../types'

import * as normalizers from './normalizers'

export type NormalizedPrismicDocumentNodeInput<
  Document extends prismicT.PrismicDocument = prismicT.PrismicDocument
> = normalizers.NormalizedDocumentValue<Document> &
  gatsby.NodeInput & {
    prismicId: string
  }

export interface NormalizerDependencies {
  getNode(id: string): NormalizedPrismicDocumentNodeInput | undefined
  getTypePath(path: string[]): TypePath | undefined
  nodeHelpers: nodeHelpers.NodeHelpers
  transformFieldName: <K extends string>(key: K) => string
  linkResolver?: prismicH.LinkResolverFunction
  htmlSerializer?: prismicH.HTMLMapSerializer | prismicH.HTMLFunctionSerializer
  imageImgixParams: imgixGatsby.ImgixUrlParams
  imagePlaceholderImgixParams: imgixGatsby.ImgixUrlParams
}

export interface NormalizeConfig<Value> {
  value: Value
  path: string[]
}

export type StructuredTextField = prismicT.RichTextField | prismicT.TitleField

export type NormalizedValue<Value> = Value extends prismicT.PrismicDocument
  ? normalizers.NormalizedDocumentValue<Value>
  : Value extends prismicT.PrismicDocument['data']
  ? normalizers.NormalizedDocumentDataValue<Value>
  : Value extends prismicT.PrismicDocument['alternate_languages']
  ? normalizers.NormalizedAlternateLanguagesValue
  : Value extends StructuredTextField
  ? normalizers.NormalizedStructuredTextValue<Value>
  : Value extends prismicT.ImageField
  ? normalizers.NormalizedImageValue<Value>
  : Value extends prismicT.LinkField
  ? normalizers.NormalizedLinkValue<Value>
  : Value extends prismicT.GroupField
  ? normalizers.NormalizedGroupValue<Value>
  : Value extends prismicT.SliceZone
  ? normalizers.NormalizedSlicesValue<Value>
  : Value extends prismicT.Slice | prismicT.SharedSlice
  ? normalizers.NormalizedSliceValue<Value>
  : Value

export type NormalizedValueMap<ValueMap extends Record<string, unknown>> = {
  [P in keyof ValueMap]: NormalizedValue<ValueMap[P]>
}
