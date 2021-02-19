import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicSchemaField,
  PrismicSpecialType,
} from '../types'
import { buildInferredNodeType } from '../lib/buildInferredNodeType'
import { createType } from '../lib/createType'
import { createTypePath } from '../lib/createTypePath'
import { dotPath } from '../lib/dotPath'
import { getTypeName } from '../lib/getTypeName'
import { reportInfo } from '../lib/reportInfo'

export const buildUnknownFieldConfig: FieldConfigCreator = (
  path: string[],
  schema: PrismicSchemaField,
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicSpecialType.Unknown)),
    RTE.chainFirst(() =>
      reportInfo(
        `An unknown field type "${schema.type}" was found at ${dotPath(
          path,
        )}. A generic inferred node type will be created. If the underlying type is not an object, manually override the type using Gatsby's createSchemaCustomization API in your site's gatsby-node.js.`,
      ),
    ),
    RTE.chain(() => buildInferredNodeType(path)),
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
    RTE.map((type) => ({
      type,
      extensions: { link: {} },
    })),
  )
