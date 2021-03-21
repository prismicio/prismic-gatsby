import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { toFieldConfig } from './toFieldConfig'

import { Dependencies, PrismicSchemaField } from '../types'

/**
 * Builds a `graphql-compose`-compatible field config map by calling
 * `lib/toFieldConfig` for each field.
 *
 * @param path Field path leading to `fieldSchemas`'s location.
 * @param fieldSchemas Record of Prismic custom type schema fields.
 *
 * @returns Field config map including `fieldSchemas`'s fields.
 */
export const buildFieldConfigMap = (
  path: string[],
  fieldSchemas: Record<string, PrismicSchemaField>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ObjectTypeComposerFieldConfigMapDefinition<unknown, unknown>
> =>
  pipe(
    fieldSchemas,
    R.mapWithIndex((name, schema) => toFieldConfig(A.snoc(path, name), schema)),
    R.sequence(RTE.readerTaskEither),
  )
