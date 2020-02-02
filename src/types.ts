import { PluginOptions as GatsbyPluginOptions } from 'gatsby'

export type NodeID = string

export interface TypePath {
  path: string[]
  type: string
}

export enum FieldType {
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
}

export enum NodeType {
  CustomType = 'PrismicSchemaCustomType',
  Field = 'PrismicSchemaField',
  SliceChoice = 'PrismicSchemaSliceChoice',
  Tab = 'PrismicSchemaTab',
}

export enum SliceChoiceDisplay {
  List = 'list',
  Grid = 'grid',
}

interface BaseFieldConfig {
  label?: string
  labels?: { [key: string]: string[] }
  placeholder?: string
  [key: string]: unknown
}

export interface BaseField {
  type: FieldType
  config: BaseFieldConfig
}

export interface SliceField extends BaseField {
  fieldset: string
  config: SliceFieldConfig
}

interface SliceFieldConfig extends BaseFieldConfig {
  choices: SliceChoices
}

export interface SliceChoices {
  [sliceId: string]: SliceChoice
}

export interface SliceChoice {
  fieldset: string
  description: string
  icon: string
  display: SliceChoiceDisplay
  repeat: Fields
  'non-repeat': Fields
}

export interface GroupField extends BaseField {
  config: GroupFieldConfig
}

interface GroupFieldConfig extends BaseFieldConfig {
  fields: Fields
}

export type Field = BaseField | SliceField | GroupField

export interface Fields {
  [fieldId: string]: Field
}

export interface Tab {
  [fieldId: string]: Field
}

export interface Schema {
  [tabName: string]: Tab
}

export interface Schemas {
  [schemaId: string]: Schema
}

export interface PluginOptions extends GatsbyPluginOptions {
  repositoryName: string
  accessToken: string
  linkResolver?: unknown
  fetchLinks?: string[]
  htmlSerializer?: unknown
  schemas: Schemas
  lang?: string
  shouldDownloadImage?: unknown
  shouldNormalizeImage?: unknown
  typePathsFilenamePrefix?: string
}
