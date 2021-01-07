import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildNamedInferredNodeType } from '../lib/buildNamedInferredNodeType'
import { getTypeName } from '../lib/getTypeName'
import { createType } from '../lib/createType'
import { createTypePath } from '../lib/createTypePath'

import { Dependencies, FieldConfigCreator, PrismicFieldType } from '../types'

export const buildEmbedFieldConfig: FieldConfigCreator = (path) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Embed)),
    RTE.map((deps: Dependencies) =>
      deps.globalNodeHelpers.createTypeName('EmbedType'),
    ),
    RTE.chain(buildNamedInferredNodeType),
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
  )
