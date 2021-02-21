import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies, PrismicFieldType, PrismicSchemaField } from '../types'

import { buildBooleanFieldConfig } from '../builders/buildBooleanFieldConfig'
import { buildColorFieldConfig } from '../builders/buildColorFieldConfig'
import { buildDateFieldConfig } from '../builders/buildDateFieldConfig'
import { buildEmbedFieldConfig } from '../builders/buildEmbedFieldConfig'
import { buildGeoPointFieldConfig } from '../builders/buildGeoPointFieldConfig'
import { buildGroupFieldConfig } from '../builders/buildGroupFieldConfig'
import { buildImageFieldConfig } from '../builders/buildImageFieldConfig'
import { buildLinkFieldConfig } from '../builders/buildLinkFieldConfig'
import { buildNumberFieldConfig } from '../builders/buildNumberFieldConfig'
import { buildSelectFieldConfig } from '../builders/buildSelectFieldConfig'
import { buildStructuredTextFieldConfig } from '../builders/buildStructuredTextFieldConfig'
import { buildSlicesFieldConfig } from '../builders/buildSlicesFieldConfig'
import { buildTextFieldConfig } from '../builders/buildTextFieldConfig'
import { buildTimestampFieldConfig } from '../builders/buildTimestampFieldConfig'
import { buildUIDFieldConfig } from '../builders/buildUIDFieldConfig'
import { buildUnknownFieldConfig } from '../builders/buildUnknownFieldConfig'
import { buildIntegrationFieldConfig } from '../builders/buildIntegrationFieldConfig'

export const toFieldConfig = (
  path: string[],
  schema: PrismicSchemaField,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfig<unknown, unknown>
> => {
  switch (schema.type) {
    case PrismicFieldType.Boolean: {
      return buildBooleanFieldConfig(path, schema)
    }

    case PrismicFieldType.Color: {
      return buildColorFieldConfig(path, schema)
    }

    case PrismicFieldType.Date: {
      return buildDateFieldConfig(path, schema)
    }

    case PrismicFieldType.Embed: {
      return buildEmbedFieldConfig(path, schema)
    }

    case PrismicFieldType.GeoPoint: {
      return buildGeoPointFieldConfig(path, schema)
    }

    case PrismicFieldType.Group: {
      return buildGroupFieldConfig(path, schema)
    }

    case PrismicFieldType.Image: {
      return buildImageFieldConfig(path, schema)
    }

    case PrismicFieldType.IntegrationFields: {
      return buildIntegrationFieldConfig(path, schema)
    }

    case PrismicFieldType.Link: {
      return buildLinkFieldConfig(path, schema)
    }

    case PrismicFieldType.Number: {
      return buildNumberFieldConfig(path, schema)
    }

    case PrismicFieldType.Select: {
      return buildSelectFieldConfig(path, schema)
    }

    case PrismicFieldType.Slices: {
      return buildSlicesFieldConfig(path, schema)
    }

    case PrismicFieldType.StructuredText: {
      return buildStructuredTextFieldConfig(path, schema)
    }

    case PrismicFieldType.Text: {
      return buildTextFieldConfig(path, schema)
    }

    case PrismicFieldType.Timestamp: {
      return buildTimestampFieldConfig(path, schema)
    }

    case PrismicFieldType.UID: {
      return buildUIDFieldConfig(path, schema)
    }

    default: {
      return buildUnknownFieldConfig(path, schema)
    }
  }
}
