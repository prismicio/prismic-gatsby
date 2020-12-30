import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicFieldType,
  PrismicSchemaField,
} from '../types'
import { reportInfo } from '../lib/reportInfo'
import { dotPath } from '../lib/dotPath'
import { buildInferredNodeType } from '../lib/buildInferredNodeType'
import { registerType } from '../lib/registerType'
import { getTypeName } from '../lib/getTypeName'
import { createTypePath } from '../lib/createTypePath'

export const createUnknownFieldConfig: FieldConfigCreator = (
  path: string[],
  schema: PrismicSchemaField,
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Unknown)),
    RTE.chainFirst(() =>
      reportInfo(
        `An unknown field type "${schema.type}" was found at ${dotPath(
          path,
        )}. A generic inferred node type will be created. If the underlying type is not an object, manually override the type using Gatsby's createSchemaCustomization API in your site's gatsby-node.js.`,
      ),
    ),
    RTE.chain(() => buildInferredNodeType(path)),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )
