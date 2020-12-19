import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow, constVoid } from 'fp-ts/function'
import {
  Dependencies,
  createBaseTypes,
  registerCustomTypes,
  registerAllDocumentTypesType,
} from 'gatsby-prismic-core'

/**
 * To be executed in the `createSchemaCustomization` stage.
 */
export const createSchemaCustomization: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain(createBaseTypes),
  RTE.chain(flow(registerCustomTypes, RTE.chain(registerAllDocumentTypesType))),
  RTE.map(constVoid),
)
