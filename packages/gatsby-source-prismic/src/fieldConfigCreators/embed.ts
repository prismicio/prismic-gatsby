import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildNamedInferredNodeType } from '../lib/buildNamedInferredNodeType'
import { getTypeName } from '../lib/getTypeName'
import { registerType } from '../lib/registerType'

import { Dependencies, FieldConfigCreator } from '../types'

export const createEmbedFieldConfig: FieldConfigCreator = () =>
  pipe(
    RTE.asks((deps: Dependencies) =>
      deps.globalNodeHelpers.createTypeName('EmbedType'),
    ),
    RTE.chain(buildNamedInferredNodeType),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )
