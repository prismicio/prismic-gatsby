import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe, flow, constVoid } from 'fp-ts/function'

import { Dependencies, PluginOptions } from './types'
import { createBaseTypes } from './lib/createBaseTypes'
import { registerCustomTypes } from './lib/registerCustomTypes'
import { registerAllDocumentTypesType } from './lib/registerAllDocumentTypesType'
import { buildDependencies } from './buildDependencies'

export const createSchemaCustomization: NonNullable<
  gatsby.GatsbyNode['createSchemaCustomization']
> = async (
  gatsbyContext: gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
) =>
  pipe(
    await RTE.run(
      createSchemaCustomizationProgram,
      buildDependencies(gatsbyContext, pluginOptions),
    ),
    E.fold(E.throwError, constVoid),
  )

/**
 * To be executed in the `createSchemaCustomization` stage.
 */
export const createSchemaCustomizationProgram: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain(createBaseTypes),
  RTE.chain(flow(registerCustomTypes, RTE.chain(registerAllDocumentTypesType))),
  RTE.map(constVoid),
)
