import {
  PluginOptions as GatsbyPluginOptions,
  SourceNodesArgs,
  NodeInput,
  Node,
} from 'gatsby'
import { FixedObject, FluidObject } from 'gatsby-image'
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents'
import * as PrismicDOM from 'prismic-dom'
import { ImgixUrlParams } from 'gatsby-plugin-imgix'

export type NodeID = string

export interface NodeTree {
  [key: string]: Node
}

export interface DocumentNodeInput extends NodeInput {
  prismicId: PrismicDocument['id']
  data: { [key: string]: NormalizedField }
  dataString: string
  dataRaw: PrismicDocument['data']
  alternate_languages: NormalizedAlternateLanguagesField
  url?: string
}

export interface SliceNodeInput extends NodeInput {
  slice_type: string
  slice_label?: string
  primary: { [key: string]: NormalizedField }
  items: { [key: string]: NormalizedField }[]
}

export interface DocumentsToNodesEnvironment {
  createNode: (node: NodeInput) => void
  createNodeId: (input: string) => string
  createContentDigest: (input: string | object) => string
  normalizeImageField: ImageFieldNormalizer
  normalizeLinkField: LinkFieldNormalizer
  normalizeSlicesField: SlicesFieldNormalizer
  normalizeStructuredTextField: StructuredTextFieldNormalizer
  typePaths: TypePath[]
  pluginOptions: PluginOptions
  context:
    | DocumentsToNodesEnvironmentNodeContext
    | DocumentsToNodesEnvironmentBrowserContext
}

export interface DocumentsToNodesEnvironmentNodeContext {
  gatsbyContext: SourceNodesArgs
}

export interface DocumentsToNodesEnvironmentBrowserContext {
  hasNodeById: (id: string) => boolean
  getNodeById: <T>(id: string) => T & Node
}

export interface TypePath {
  path: string[]
  type: GraphQLType | string
}

export type FieldNormalizer<T, N> = (
  apiId: string,
  field: T,
  path: TypePath['path'],
  doc: PrismicDocument,
  env: DocumentsToNodesEnvironment,
) => N | Promise<N>

export type ImageFieldNormalizer = FieldNormalizer<
  ImageField,
  NormalizedImageField
>

export type LinkFieldNormalizer = FieldNormalizer<
  LinkField,
  NormalizedLinkField
>

export type SlicesFieldNormalizer = FieldNormalizer<
  SliceIDsField,
  NormalizedSlicesField
>

export type StructuredTextFieldNormalizer = FieldNormalizer<
  StructuredTextField,
  NormalizedStructuredTextField
>

export type Field =
  | StructuredTextField
  | ImageField
  | SlicesField
  | GroupField
  | LinkField
  | AlternateLanguagesField
  | string
  | number
  | boolean
  | null

export type NormalizedField =
  | NormalizedStructuredTextField
  | NormalizedImageField
  | NormalizedSlicesField
  | NormalizedGroupField
  | NormalizedLinkField
  | NormalizedAlternateLanguagesField
  | Field

export type StructuredTextField = {
  type: string
  text: string
  spans: { [key: string]: unknown }
}[]

export interface NormalizedStructuredTextField {
  html: string
  text: string
  raw: StructuredTextField
}

export type SlicesField = Slice[]

interface Slice {
  slice_type: string
  slice_label: string | null
  items: { [key: string]: Field }[]
  primary: { [key: string]: Field }
}

export type SliceIDsField = NodeID[]

export type NormalizedSlicesField = NodeID[]

export enum LinkFieldType {
  Any = 'Any',
  Document = 'Document',
  Media = 'Media',
  Web = 'Web',
}

export interface LinkField {
  link_type: LinkFieldType
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

export interface NormalizedLinkField extends LinkField {
  url: string
  document?: NodeID
  raw: LinkField
}

export interface ImageField {
  alt?: string
  copyright?: string
  dimensions?: { width: number; height: number }
  url?: string
  // This should be ImageThumbnailField, but TypeScript does not let us
  // type unknown field types separatly from known without widening the type.
  [key: string]: unknown
}

export interface NormalizedImageField extends ImageField {
  thumbnails?: { [key: string]: NormalizedImageField }
  fixed?: FixedObject
  fluid?: FluidObject
  localFile?: NodeID
}

export type AlternateLanguagesField = LinkField[]

export type NormalizedAlternateLanguagesField = AlternateLanguagesField

export type GroupField = { [key: string]: Field }[]

export type NormalizedGroupField = { [key: string]: NormalizedField }[]

export enum FieldType {
  Boolean = 'Boolean',
  Color = 'Color',
  Date = 'Date',
  Embed = 'Embed',
  GeoPoint = 'GeoPoint',
  Group = 'Group',
  Image = 'Image',
  Link = 'Link',
  Number = 'Number',
  Select = 'Select',
  Slice = 'Slice',
  Slices = 'Slices',
  StructuredText = 'StructuredText',
  Text = 'Text',
  Timestamp = 'Timestamp',
  UID = 'UID',
  // Internal plugin-specific field not defined in the in Prismic schema.
  AlternateLanguages = 'AlternateLanguages',
}

export enum GraphQLType {
  ID = 'ID',
  Boolean = 'Boolean',
  String = 'String',
  Float = 'Float',
  Date = 'Date',
  JSON = 'JSON',
  Link = 'PrismicLinkType',
  Image = 'PrismicImageType',
  ImageThumbnail = 'PrismicImageThumbnailType',
  ImageThumbnails = 'PrismicImageThumbnailsType',
  Embed = 'PrismicEmbedType',
  GeoPoint = 'PrismicGeoPointType',
  StructuredText = 'PrismicStructuredTextType',
  AllDocumentTypes = 'PrismicAllDocumentTypes',
  Group = 'Group',
  Slices = 'Slices',
  AlternateLanguages = 'AlternateLanguages',
}

export interface GraphQLTypeObj {
  type: GraphQLType | string
  extensions?: { [key: string]: any }
  resolve?: Function
}

interface BaseFieldConfigSchema {
  label?: string
  labels?: { [key: string]: string[] }
  placeholder?: string
  [key: string]: unknown
}

export interface BaseFieldSchema {
  type: FieldType
  config: BaseFieldConfigSchema
}

export interface ImageFieldSchema extends BaseFieldSchema {
  type: FieldType.Image
  config: ImageFieldConfigSchema
}

interface ThumbnailSchema {
  name: string
  width?: string
  height?: string
}

interface ImageFieldConfigSchema extends BaseFieldConfigSchema {
  constraint?: { width?: number; height?: number }
  thumbnails?: ThumbnailSchema[]
}

export interface SlicesFieldSchema extends BaseFieldSchema {
  type: FieldType.Slices
  fieldset: string
  config: SlicesFieldConfigSchema
}

interface SlicesFieldConfigSchema extends BaseFieldConfigSchema {
  choices: SliceChoicesSchema
}

export interface SliceChoicesSchema {
  [sliceId: string]: SliceFieldSchema
}

enum SliceChoiceDisplay {
  List = 'list',
  Grid = 'grid',
}

export interface SliceFieldSchema extends BaseFieldSchema {
  type: FieldType.Slice
  fieldset: string
  description: string
  icon: string
  display: SliceChoiceDisplay
  repeat?: FieldsSchema
  'non-repeat'?: FieldsSchema
}

export interface GroupFieldSchema extends BaseFieldSchema {
  type: FieldType.Group
  config: GroupFieldConfigSchema
}

interface GroupFieldConfigSchema extends BaseFieldConfigSchema {
  fields: FieldsSchema
}

export type FieldSchema =
  | BaseFieldSchema
  | ImageFieldSchema
  | SlicesFieldSchema
  | GroupFieldSchema
  | SliceFieldSchema

export interface FieldsSchema {
  [fieldId: string]: FieldSchema
}

export interface Schema {
  [tabName: string]: {
    [fieldId: string]: FieldSchema
  }
}

export interface Schemas {
  [schemaId: string]: Schema
}

export type LinkResolver = (doc: object) => string
export type PluginLinkResolver = (input: {
  key?: string
  value?: unknown
  node: PrismicDocument
}) => LinkResolver

export type HTMLSerializer = typeof PrismicDOM.HTMLSerializer
export type PluginHTMLSerializer = (input: {
  key: string
  value: unknown
  node: PrismicDocument
}) => HTMLSerializer

type ShouldDownloadImage = (input: {
  key: string
  value: unknown
  node: PrismicDocument
}) => boolean | Promise<boolean>

export type BrowserPluginOptions = GatsbyPluginOptions &
  Pick<
    PluginOptions,
    | 'repositoryName'
    | 'accessToken'
    | 'fetchLinks'
    | 'schemas'
    | 'lang'
    | 'typePathsFilenamePrefix'
    | 'prismicToolbar'
  >

export interface PluginOptions extends GatsbyPluginOptions {
  repositoryName: string
  releaseID?: string
  accessToken?: string
  linkResolver?: PluginLinkResolver
  htmlSerializer?: PluginHTMLSerializer
  fetchLinks?: string[]
  schemas: Schemas
  lang?: string
  shouldDownloadImage?: ShouldDownloadImage
  shouldNormalizeImage?: ShouldDownloadImage
  typePathsFilenamePrefix?: string
  prismicToolbar?: boolean | 'legacy'
  imageImgixParams?: ImgixUrlParams
  imagePlaceholderImgixParams?: ImgixUrlParams
  webhookSecret?: string
}

export interface WebhookBase {
  type: 'api-update' | 'test-trigger'
  domain: string
  apiUrl: string
  secret: string | null
}

export interface TestWebhook extends WebhookBase {
  type: 'test-trigger'
}

interface Operations<T> {
  update?: T[]
  addition?: T[]
  deletion?: T[]
}

export interface PrismicWebhook extends WebhookBase {
  type: 'api-update'
  masterRef?: string
  releases: Operations<WebhookRelease>
  masks: Operations<WebhookMask>
  tags: Operations<WebhookTag>
  documents: string[]
  experiments?: Operations<WebhookExperiment>
}

export interface WebhookRelease {
  id: string
  ref: string
  label: string
  documents: string[]
}

export interface WebhookMask {
  id: string
  label: string
}

export interface WebhookTag {
  id: string
}

// Legacy fields
interface WebhookExperimentVariation {
  id: string
  ref: string
  label: string
}
interface WebhookExperiment {
  id: string
  name: string
  variations: WebhookExperimentVariation[]
}
