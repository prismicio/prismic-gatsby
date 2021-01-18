import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as PrismicDOM from 'prismic-dom'
import { Document as _PrismicAPIDocument } from 'prismic-javascript/types/documents'

export interface PluginOptions extends gatsby.PluginOptions {
  repositoryName: string
  accessToken?: string
  apiEndpoint: string
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
  linkResolver?: (doc: gatsbyPrismic.PrismicAPIDocument) => string
  htmlSerializer?: typeof PrismicDOM.HTMLSerializer
  imageImgixParams: gatsbyImgix.ImgixUrlParams
  imagePlaceholderImgixParams: gatsbyImgix.ImgixUrlParams
  typePrefix?: string
  toolbar: PrismicToolbarType
  plugins: []
}

export enum PrismicToolbarType {
  New = 'new',
  Legacy = 'legacy',
}

export type TypePathsStore = Record<string, gatsbyPrismic.PrismicTypePathType>

export interface PrismicAPIDocument<
  TData extends UnknownRecord<string> = UnknownRecord<string>
> extends _PrismicAPIDocument {
  data: TData
}

export type LinkResolver = (doc: PrismicAPIDocument) => string

type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<K, unknown>
