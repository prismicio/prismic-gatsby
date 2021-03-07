import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as prismic from 'ts-prismic'
import * as PrismicDOM from 'prismic-dom'
import { NodeHelpers } from 'gatsby-node-helpers'

export type ResolveType<T> = T extends PromiseLike<infer U> ? U : T

export type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<
  K,
  unknown
>

export type JoiValidationError = InstanceType<
  gatsby.PluginOptionsSchemaArgs['Joi']['ValidationError']
>

export interface TypePath {
  path: string[]
  type: PrismicTypePathType
}

export type TypePathNode = TypePath & gatsby.Node

export interface Dependencies {
  createTypes: gatsby.Actions['createTypes']
  createNode: gatsby.Actions['createNode']
  buildObjectType: gatsby.NodePluginSchema['buildObjectType']
  buildUnionType: gatsby.NodePluginSchema['buildUnionType']
  buildEnumType: gatsby.NodePluginSchema['buildEnumType']
  buildInterfaceType: gatsby.NodePluginSchema['buildInterfaceType']
  getNode: gatsby.SourceNodesArgs['getNode']
  getNodes: gatsby.SourceNodesArgs['getNodes']
  touchNode: gatsby.Actions['touchNode']
  deleteNode: gatsby.Actions['deleteNode']
  createNodeId: gatsby.NodePluginArgs['createNodeId']
  createContentDigest: gatsby.NodePluginArgs['createContentDigest']
  schema: gatsby.NodePluginSchema
  cache: gatsby.GatsbyCache
  store: gatsby.Store
  reporter: gatsby.Reporter
  reportInfo: gatsby.Reporter['info']
  reportWarning: gatsby.Reporter['warn']
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
  pluginOptions: PluginOptions
  webhookBody?: unknown
}

export interface PluginOptions extends gatsby.PluginOptions {
  repositoryName: string
  accessToken?: string
  apiEndpoint: string
  releaseID?: string
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
  linkResolver?: (doc: prismic.Document) => string
  htmlSerializer?: typeof PrismicDOM.HTMLSerializer
  schemas: Record<string, PrismicSchema>
  imageImgixParams: gatsbyImgix.ImgixUrlParams
  imagePlaceholderImgixParams: gatsbyImgix.ImgixUrlParams
  typePrefix?: string
  webhookSecret?: string
  plugins: []
}

export type FieldConfigCreator<
  TSchema extends PrismicSchemaField = PrismicSchemaField
> = (
  path: string[],
  schema: TSchema,
) => RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfig<unknown, unknown>
>

export interface PrismicSchema {
  [tabName: string]: PrismicSchemaTab
}

interface PrismicSchemaTab {
  [fieldName: string]: PrismicSchemaField
}

export type PrismicSchemaField =
  | PrismicSchemaStandardField
  | PrismicSchemaImageField
  | PrismicSchemaGroupField
  | PrismicSchemaSlicesField

export type PrismicTypePathType = PrismicSpecialType | PrismicFieldType

export enum PrismicSpecialType {
  Document = 'Document',
  DocumentData = 'DocumentData',
  Unknown = 'Unknown',
}

export enum PrismicFieldType {
  Boolean = 'Boolean',
  Color = 'Color',
  Date = 'Date',
  Embed = 'Embed',
  GeoPoint = 'GeoPoint',
  Group = 'Group',
  Image = 'Image',
  IntegrationFields = 'IntegrationFields',
  Link = 'Link',
  Number = 'Number',
  Select = 'Select',
  Slice = 'Slice',
  Slices = 'Slices',
  StructuredText = 'StructuredText',
  Text = 'Text',
  Timestamp = 'Timestamp',
  UID = 'UID',
}

interface PrismicSchemaStandardField {
  type: Exclude<PrismicFieldType, 'Image' | 'Group' | 'Slice' | 'Slices'>
  config: {
    label?: string
    placeholder?: string
  }
}

export interface PrismicSchemaImageField {
  type: PrismicFieldType.Image
  config: {
    label?: string
    thumbnails?: PrismicSchemaImageThumbnail[]
  }
}

export interface PrismicSchemaImageThumbnail {
  name: string
  width?: number
  height?: number
}

export interface PrismicSchemaGroupField {
  type: PrismicFieldType.Group
  config: {
    label?: string
    placeholder?: string
    fields: Record<string, PrismicSchemaStandardField>
  }
}

export interface PrismicSchemaSlicesField {
  type: PrismicFieldType.Slices
  config: {
    labels?: Record<string, string[]>
    choices: Record<string, PrismicSchemaSlice>
  }
}

export interface PrismicSchemaSlice {
  type: PrismicFieldType.Slice
  'non-repeat': Record<string, PrismicSchemaStandardField>
  repeat: Record<string, PrismicSchemaStandardField>
}

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
  dimensions: { width: number; height: number } | null
  alt: string | null
  copyright: string | null
  url: string | null
  [key: string]: unknown
}

export type PrismicAPIStructuredTextField = {
  type: string
  text: string
  spans: { [key: string]: unknown }
}[]

export interface PrismicAPIDocumentNode extends prismic.Document, gatsby.Node {
  prismicId: string
}

export type PrismicAPISliceField = {
  slice_type: string
  slice_label: string
  items: UnknownRecord[]
  primary: UnknownRecord
}

export type PrismicWebhookBody =
  | PrismicWebhookBodyApiUpdate
  | PrismicWebhookBodyTestTrigger

export enum PrismicWebhookType {
  APIUpdate = 'api-update',
  TestTrigger = 'test-trigger',
}

interface PrismicWebhookBodyBase {
  type: PrismicWebhookType
  domain: string
  apiUrl: string
  secret: string | null
}

export interface PrismicWebhookBodyApiUpdate extends PrismicWebhookBodyBase {
  type: PrismicWebhookType.APIUpdate
  masterRef?: string
  releases: PrismicWebhookOperations<PrismicWebhookRelease>
  masks: PrismicWebhookOperations<PrismicWebhookMask>
  tags: PrismicWebhookOperations<PrismicWebhookTag>
  documents: string[]
  experiments?: PrismicWebhookOperations<PrismicWebhookExperiment>
}

export interface PrismicWebhookBodyTestTrigger extends PrismicWebhookBodyBase {
  type: PrismicWebhookType.TestTrigger
}

interface PrismicWebhookOperations<T> {
  update?: T[]
  addition?: T[]
  deletion?: T[]
}

interface PrismicWebhookMask {
  id: string
  label: string
}

interface PrismicWebhookTag {
  id: string
}

export interface PrismicWebhookRelease {
  id: string
  ref: string
  label: string
  documents: string[]
}

/**
 * @deprecated
 */
interface PrismicWebhookExperiment {
  id: string
  name: string
  variations: PrismicWebhookExperimentVariation[]
}

/**
 * @deprecated
 */
interface PrismicWebhookExperimentVariation {
  id: string
  ref: string
  label: string
}
