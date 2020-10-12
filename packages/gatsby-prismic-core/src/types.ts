import * as gatsby from 'gatsby'
import * as D from 'io-ts/Decoder'
import Prismic from 'prismic-javascript'
import { Document as _PrismicAPIDocument } from 'prismic-javascript/types/documents'
import { QueryOptions as _PrismicClientQueryOptions } from 'prismic-javascript/types/ResolvedApi'

import {
  PluginOptionsD,
  PrismicSchemaD,
  PrismicTabSchemaD,
  PrismicSliceSchemaD,
} from './decoders'
import { NodeHelpers } from './lib/nodeHelpers'

export { Document as PrismicDocument } from 'prismic-javascript/types/documents'

export type ResolveType<T> = T extends PromiseLike<infer U> ? U : T

export type UnknownRecord = Record<string, unknown>

export interface Dependencies {
  createTypes: gatsby.Actions['createTypes']
  createNode: gatsby.Actions['createNode']
  buildObjectType: gatsby.NodePluginSchema['buildObjectType']
  buildUnionType: gatsby.NodePluginSchema['buildUnionType']
  buildEnumType: gatsby.NodePluginSchema['buildEnumType']
  cache: gatsby.GatsbyCache
  reportInfo: gatsby.Reporter['info']
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
  pluginOptions: PluginOptions
}

export type PluginOptions = D.TypeOf<typeof PluginOptionsD>
export type PrismicSchema = D.TypeOf<typeof PrismicSchemaD>
export type PrismicTabSchema = D.TypeOf<typeof PrismicTabSchemaD>
export type PrismicSliceSchema = D.TypeOf<typeof PrismicSliceSchemaD>
// The recursive type in `config.fields` requires the type to be defined in the
// type system rather than derived from io-ts.
export type PrismicFieldSchema =
  | {
      type:
        | 'Boolean'
        | 'Color'
        | 'Date'
        | 'Embed'
        | 'GeoPoint'
        | 'Image'
        | 'Link'
        | 'Number'
        | 'Select'
        | 'StructuredText'
        | 'Text'
        | 'Timestamp'
        | 'UID'
      config: {
        label?: string
        placeholder?: string
      }
    }
  | {
      type: 'Group'
      config: {
        label?: string
        placeholder?: string
        fields: Record<string, PrismicFieldSchema>
      }
    }
  | {
      type: 'Slices'
      config: {
        labels?: Record<string, string[]>
        choices: Record<string, PrismicSliceSchema>
      }
    }

export type PrismicClient = ResolveType<ReturnType<typeof Prismic.getApi>>
export type PrismicClientQueryOptions = _PrismicClientQueryOptions

export type PrismicAPILinkField = {
  link_type: 'Any' | 'Document' | 'Media' | 'Web'
  isBroken: boolean
  url?: string
  target?: string
  size?: number
  id?: string
  type?: string
  tags?: string[]
  lang?: string
  slug?: string
  uid?: string
}

export type PrismicAPIImageField = {
  dimensions: { width: number; height: number }
  alt: string | null
  copyright: string | null
  url: string
  [key: string]: unknown
}

export type PrismicAPIStructuredTextField = {
  type: string
  text: string
  spans: { [key: string]: unknown }
}[]

export interface PrismicAPIDocument extends _PrismicAPIDocument {
  data: UnknownRecord
}

export interface PrismicAPIDocumentNode
  extends PrismicAPIDocument,
    gatsby.Node {
  prismicId: string
}

export type PrismicAPISliceField = {
  slice_type: string
  slice_label: string
  items: UnknownRecord[]
  primary: UnknownRecord
}
