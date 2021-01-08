import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as PrismicDOM from 'prismic-dom'
import { PrismicSchema, PrismicAPIDocument } from 'gatsby-source-prismic'

export interface PluginOptions extends gatsby.PluginOptions {
  repositoryName: string
  accessToken?: string
  apiEndpoint?: string
  releaseID?: string
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
  linkResolver?: (doc: PrismicAPIDocument) => string
  htmlSerializer?: typeof PrismicDOM.HTMLSerializer
  schemas: Record<string, PrismicSchema>
  imageImgixParams: gatsbyImgix.ImgixUrlParams
  imagePlaceholderImgixParams: gatsbyImgix.ImgixUrlParams
  downloadLocal: boolean
  typePrefix?: string
  webhookSecret?: string
  plugins: []
}
