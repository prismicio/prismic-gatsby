import * as D from 'io-ts/Decoder'

import {
  PrismicFieldTypeC,
  PluginOptionsC,
  PrismicSchemaC,
  PrismicTabSchemaC,
  PrismicSliceSchemaC,
} from './decoders'

export type UnknownRecord = Record<string, unknown>

export type PluginOptions = D.TypeOf<typeof PluginOptionsC>
export type PrismicFieldType = D.TypeOf<typeof PrismicFieldTypeC>
export type PrismicSchema = D.TypeOf<typeof PrismicSchemaC>
export type PrismicTabSchema = D.TypeOf<typeof PrismicTabSchemaC>
export type PrismicSliceSchema = D.TypeOf<typeof PrismicSliceSchemaC>
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
