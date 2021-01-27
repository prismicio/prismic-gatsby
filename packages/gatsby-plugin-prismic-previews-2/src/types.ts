import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as PrismicDOM from 'prismic-dom'
import { Document as _PrismicAPIDocument } from 'prismic-javascript/types/documents'

export interface PluginOptions extends gatsby.PluginOptions {
  repositoryName: string
  accessToken?: string
  promptForAccessToken?: boolean
  apiEndpoint: string
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
  imageImgixParams: gatsbyImgix.ImgixUrlParams
  imagePlaceholderImgixParams: gatsbyImgix.ImgixUrlParams
  typePrefix?: string
  toolbar: 'new' | 'legacy'
  plugins: []
}

export type TypePathsStore = Record<string, gatsbyPrismic.PrismicTypePathType>

export interface PrismicAPIDocument<
  TData extends UnknownRecord<string> = UnknownRecord<string>
> extends _PrismicAPIDocument {
  data: TData
}

export interface PrismicAPIDocumentNodeInput<
  TData extends UnknownRecord<string> = UnknownRecord<string>
> extends PrismicAPIDocument<TData>,
    gatsby.NodeInput {
  prismicId: string
}

export type LinkResolver = (doc: PrismicAPIDocument) => string
export type HTMLSerializer = typeof PrismicDOM.HTMLSerializer

export type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<
  K,
  unknown
>
