import * as gatsby from 'gatsby'
import { NodeHelpers } from 'gatsby-node-helpers'
import {
  PluginOptions as SourcePluginOptions,
  PrismicTypePathType,
} from 'gatsby-source-prismic'

export type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<
  K,
  unknown
>

export interface Dependencies {
  createNode: (node: gatsby.NodeInput) => void
  getNode: (id: string) => gatsby.NodeInput | undefined
  getFieldType: (path: string[]) => PrismicTypePathType | undefined
  cache: Map<string, unknown>
  reportInfo: (message: string) => void
  reportWarning: (message: string) => void
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
  pluginOptions: PluginOptions
}

export interface PluginOptions
  extends Pick<
    SourcePluginOptions,
    | 'repositoryName'
    | 'accessToken'
    | 'apiEndpoint'
    | 'releaseID'
    | 'graphQuery'
    | 'fetchLinks'
    | 'lang'
    | 'linkResolver'
    | 'htmlSerializer'
    | 'imageImgixParams'
    | 'imagePlaceholderImgixParams'
    | 'typePrefix'
    | 'plugins'
  > {
  toolbar?: boolean | 'legacy'
}
