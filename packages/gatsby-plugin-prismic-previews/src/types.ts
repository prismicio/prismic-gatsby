import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as PrismicDOM from 'prismic-dom'

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
  writeTypePathsToFilesystem: (
    args: WriteTypePathsToFilesystemArgs,
  ) => void | Promise<void>
}

export type WriteTypePathsToFilesystemArgs = {
  publicPath: string
  serializedTypePaths: string
}

export type TypePathsStore = Record<string, gatsbyPrismic.PrismicTypePathType>

export interface PrismicAPIDocumentNodeInput<TData = Record<string, unknown>>
  extends prismic.Document<TData>,
    gatsby.NodeInput {
  prismicId: string
}

export type LinkResolver = (doc: prismic.Document) => string
export type HTMLSerializer = typeof PrismicDOM.HTMLSerializer

export type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<
  K,
  unknown
>
