import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, PrismicSchemaField } from '../types'
import { buildObjectType } from './buildObjectType'
import { buildSchemaRecordConfigMap } from './buildSchemaRecordConfigMap'

export const buildSchemaRecordType = (
  path: string[],
  record: Record<string, PrismicSchemaField>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        buildSchemaRecordConfigMap(path, record),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(...path),
            fields,
          }),
        ),
      ),
    ),
  )
