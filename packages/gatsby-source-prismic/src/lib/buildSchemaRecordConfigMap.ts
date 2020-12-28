import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { toFieldConfig } from './toFieldConfig'

import { Dependencies, PrismicSchemaField } from '../types'

export const buildSchemaRecordConfigMap = (
  path: string[],
  record: Record<string, PrismicSchemaField>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfigMap<unknown, unknown>
> =>
  pipe(
    record,
    R.mapWithIndex((name, schema) => toFieldConfig(A.snoc(path, name), schema)),
    R.sequence(RTE.readerTaskEither),
  )
