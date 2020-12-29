import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'

import { registerType } from '../lib/registerType'
import { getTypeName } from '../lib/getTypeName'
import { listTypeName } from '../lib/listTypeName'
import { buildSchemaRecordType } from '../lib/buildSchemaRecordType'

import { FieldConfigCreator, PrismicSchemaGroupField } from '../types'

export const createGroupFieldConfig: FieldConfigCreator<PrismicSchemaGroupField> = (
  path,
  schema,
) =>
  pipe(
    buildSchemaRecordType(A.snoc(path, 'GroupType'), schema.config.fields),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
    RTE.map(listTypeName),
  )
