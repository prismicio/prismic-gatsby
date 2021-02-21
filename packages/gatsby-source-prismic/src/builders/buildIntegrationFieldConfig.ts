import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildInferredNodeType } from '../lib/buildInferredNodeType'
import { createType } from '../lib/createType'
import { createTypePath } from '../lib/createTypePath'
import { getTypeName } from '../lib/getTypeName'

import { Dependencies, FieldConfigCreator, PrismicFieldType } from '../types'

export const buildIntegrationFieldConfig: FieldConfigCreator = (
  path: string[],
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() =>
      createTypePath(path, PrismicFieldType.IntegrationFields),
    ),
    RTE.chain(() => buildInferredNodeType([...path, 'IntegrationType'])),
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
    RTE.map((type) => ({
      type,
      extensions: { link: {} },
    })),
  )
