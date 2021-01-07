import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies, PrismicFieldType, PrismicSchemaField } from '../types'

import { createBooleanFieldConfig } from '../fieldConfigCreators/Boolean'
import { createColorFieldConfig } from '../fieldConfigCreators/Color'
import { createDateFieldConfig } from '../fieldConfigCreators/Date'
import { createEmbedFieldConfig } from '../fieldConfigCreators/Embed'
import { createGeoPointFieldConfig } from '../fieldConfigCreators/GeoPoint'
import { createGroupFieldConfig } from '../fieldConfigCreators/Group'
import { createImageFieldConfig } from '../fieldConfigCreators/Image'
import { createLinkFieldConfig } from '../fieldConfigCreators/Link'
import { createNumberFieldConfig } from '../fieldConfigCreators/Number'
import { createSelectFieldConfig } from '../fieldConfigCreators/Select'
import { createStructuredTextFieldConfig } from '../fieldConfigCreators/StructuredText'
import { createSlicesFieldConfig } from '../fieldConfigCreators/Slices'
import { createTextFieldConfig } from '../fieldConfigCreators/Text'
import { createTimestampFieldConfig } from '../fieldConfigCreators/Timestamp'
import { createUIDFieldConfig } from '../fieldConfigCreators/UID'
import { createUnknownFieldConfig } from '../fieldConfigCreators/unknown'

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
      return createBooleanFieldConfig(path, schema)
    }

    case PrismicFieldType.Color: {
      return createColorFieldConfig(path, schema)
    }

    case PrismicFieldType.Date: {
      return createDateFieldConfig(path, schema)
    }

    case PrismicFieldType.Embed: {
      return createEmbedFieldConfig(path, schema)
    }

    case PrismicFieldType.GeoPoint: {
      return createGeoPointFieldConfig(path, schema)
    }

    case PrismicFieldType.Group: {
      return createGroupFieldConfig(path, schema)
    }

    case PrismicFieldType.Image: {
      return createImageFieldConfig(path, schema)
    }

    case PrismicFieldType.Link: {
      return createLinkFieldConfig(path, schema)
    }

    case PrismicFieldType.Number: {
      return createNumberFieldConfig(path, schema)
    }

    case PrismicFieldType.Select: {
      return createSelectFieldConfig(path, schema)
    }

    case PrismicFieldType.Slices: {
      return createSlicesFieldConfig(path, schema)
    }

    case PrismicFieldType.StructuredText: {
      return createStructuredTextFieldConfig(path, schema)
    }

    case PrismicFieldType.Text: {
      return createTextFieldConfig(path, schema)
    }

    case PrismicFieldType.Timestamp: {
      return createTimestampFieldConfig(path, schema)
    }

    case PrismicFieldType.UID: {
      return createUIDFieldConfig(path, schema)
    }

    default: {
      return createUnknownFieldConfig(path, schema)
    }
  }
}
