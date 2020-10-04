import * as gatsby from 'gatsby'
import * as D from 'io-ts/Decoder'
import Prismic from 'prismic-javascript'
import { QueryOptions } from 'prismic-javascript/types/ResolvedApi'

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
export type PrismicClientQueryOptions = QueryOptions

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

export type PrismicAPIStructuredTextField = {
  type: string
  text: string
  spans: { [key: string]: unknown }
}[]

type PrismicAPILinkedDocument = {
  id: string
  tags: string[]
  type: string
  slug: string
  lang: string
}

export interface PrismicAPIDocument {
  id: string
  uid: string | null
  type: string
  href: string
  tags: string[]
  first_publication_date: string
  last_publication_date: string
  slugs: string[]
  linked_documents: PrismicAPILinkedDocument[]
  lang: string
  alternate_languages: PrismicAPILinkedDocument[]
  data: UnknownRecord
}

export interface PrismicAPIDocumentNode
  extends PrismicAPIDocument,
    gatsby.Node {
  prismicId: string
}
