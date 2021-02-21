import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { createTypePath } from '../lib/createTypePath'

import { Dependencies, FieldConfigCreator, PrismicFieldType } from '../types'

export const buildLinkFieldConfig: FieldConfigCreator = (path) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Link)),
    RTE.map((deps) => deps.nodeHelpers.createTypeName('LinkType')),
  )
