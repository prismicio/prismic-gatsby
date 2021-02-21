import * as RTE from 'fp-ts/ReaderTaskEither'
import { identity, pipe } from 'fp-ts/function'

import { createTypePath } from '../lib/createTypePath'
import { dotPath } from '../lib/dotPath'
import { reportInfo } from '../lib/reportInfo'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicSchemaField,
  PrismicSpecialType,
} from '../types'

// TODO: Convert this to a JSON field. Continue to print the message.
// This was originally intended for Integration fields but the schemas provide
// enough information for integration fields to be handled in a more correct
// way.
// TODO: Add test
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
        )}. A generic JSON type will be used. You can manually override the type using Gatsby's createSchemaCustomization API in your site's gatsby-node.js.`,
      ),
    ),
    RTE.map(() => ({
      type: 'JSON',
      resolve: identity,
    })),
  )
