import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { createType } from '../lib/createType'
import { getTypeName } from '../lib/getTypeName'
import { listTypeName } from '../lib/listTypeName'
import { buildSchemaRecordType } from '../lib/buildSchemaRecordType'
import { createTypePath } from '../lib/createTypePath'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicFieldType,
  PrismicSchemaGroupField,
} from '../types'

export const buildGroupFieldConfig: FieldConfigCreator<PrismicSchemaGroupField> = (
  path,
  schema,
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Group)),
    RTE.chain(() => buildSchemaRecordType(path, schema.config.fields)),
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
    RTE.map(listTypeName),
  )
