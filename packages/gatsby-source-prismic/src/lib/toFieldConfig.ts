import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, PrismicFieldType, PrismicSchemaField } from '../types'

export const toFieldConfig = (
  path: string[],
  schema: PrismicSchemaField,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfig<unknown, unknown>
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) => {
      switch (schema.type) {
        case PrismicFieldType.Boolean: {
          return deps.fieldConfigCreators.Boolean(path, schema)
        }

        case PrismicFieldType.Color: {
          return deps.fieldConfigCreators.Color(path, schema)
        }

        case PrismicFieldType.Date: {
          return deps.fieldConfigCreators.Date(path, schema)
        }

        case PrismicFieldType.Embed: {
          return deps.fieldConfigCreators.Embed(path, schema)
        }

        case PrismicFieldType.GeoPoint: {
          return deps.fieldConfigCreators.GeoPoint(path, schema)
        }

        case PrismicFieldType.Group: {
          return deps.fieldConfigCreators.Group(path, schema)
        }

        case PrismicFieldType.Image: {
          return deps.fieldConfigCreators.Image(path, schema)
        }

        case PrismicFieldType.Link: {
          return deps.fieldConfigCreators.Link(path, schema)
        }

        case PrismicFieldType.Number: {
          return deps.fieldConfigCreators.Number(path, schema)
        }

        case PrismicFieldType.Select: {
          return deps.fieldConfigCreators.Select(path, schema)
        }

        case PrismicFieldType.Slices: {
          return deps.fieldConfigCreators.Slices(path, schema)
        }

        case PrismicFieldType.StructuredText: {
          return deps.fieldConfigCreators.StructuredText(path, schema)
        }

        case PrismicFieldType.Text: {
          return deps.fieldConfigCreators.Text(path, schema)
        }

        case PrismicFieldType.Timestamp: {
          return deps.fieldConfigCreators.Timestamp(path, schema)
        }

        case PrismicFieldType.UID: {
          return deps.fieldConfigCreators.UID(path, schema)
        }

        case PrismicFieldType.Unknown:
        default: {
          return deps.fieldConfigCreators.Unknown(path, schema)
        }
      }
    }),
  )
