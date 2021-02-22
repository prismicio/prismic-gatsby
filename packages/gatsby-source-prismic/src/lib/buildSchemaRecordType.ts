import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, PrismicSchemaField } from '../types'
import { buildObjectType } from './buildObjectType'
import { buildFieldConfigMap } from './buildFieldConfigMap'

export const buildSchemaRecordType = (
  path: string[],
  record: Record<string, PrismicSchemaField>,
  typeName: string | string[] = path,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('fields', () => buildFieldConfigMap(path, record)),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName(typeName),
        fields: scope.fields,
      }),
    ),
  )
