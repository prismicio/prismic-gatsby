import * as gatsby from 'gatsby'
import * as D from 'io-ts/Decoder'
import Prismic from 'prismic-javascript'
import { QueryOptions } from 'prismic-javascript/types/ResolvedApi'

import {
  PrismicFieldTypeD,
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
  gatsbyCreateTypes: gatsby.Actions['createTypes']
  gatsbyCreateNode: gatsby.Actions['createNode']
  gatsbyBuildObjectType: gatsby.NodePluginSchema['buildObjectType']
  gatsbyBuildUnionType: gatsby.NodePluginSchema['buildUnionType']
  gatsbyReportInfo: gatsby.Reporter['info']
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
  pluginOptions: PluginOptions
}

export type PluginOptions = D.TypeOf<typeof PluginOptionsD>
export type PrismicFieldType = D.TypeOf<typeof PrismicFieldTypeD>
export type PrismicSchema = D.TypeOf<typeof PrismicSchemaD>
export type PrismicTabSchema = D.TypeOf<typeof PrismicTabSchemaD>
export type PrismicSliceSchema = D.TypeOf<typeof PrismicSliceSchemaD>
// The recursive type in `config.fields` requires the type to be defined in the
// type system rather than derived from io-ts.
export type PrismicFieldSchema =
  | {
      type: Exclude<PrismicFieldType, 'Group' | 'Slices'>
      config: Partial<{
        label: string
        placeholder: string
        fields: Record<string, PrismicFieldSchema>
      }>
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
