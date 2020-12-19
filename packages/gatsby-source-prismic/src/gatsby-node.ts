import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { PluginOptionsD } from 'gatsby-prismic-core'

import { buildDependencies } from './buildDependencies'
import { sourceNodes as sourceNodesProgram } from './gatsby-node-sourceNodes'
import { createSchemaCustomization as createSchemaCustomizationProgram } from './gatsby-node-createSchemaCustomization'

export const sourceNodes: NonNullable<gatsby.GatsbyNode['sourceNodes']> = (
  gatsbyContext: gatsby.SourceNodesArgs,
  pluginOptions: gatsby.PluginOptions,
) =>
  pipe(
    PluginOptionsD.decode(pluginOptions),
    E.fold(
      (error) => gatsbyContext.reporter.panic(new Error(D.draw(error))),
      (pluginOptions) =>
        RTE.run(
          sourceNodesProgram,
          buildDependencies(gatsbyContext, pluginOptions),
        ),
    ),
  )

export const createSchemaCustomization: NonNullable<
  gatsby.GatsbyNode['createSchemaCustomization']
> = (
  gatsbyContext: gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: gatsby.PluginOptions,
) =>
  pipe(
    PluginOptionsD.decode(pluginOptions),
    E.fold(
      (error) => gatsbyContext.reporter.panic(new Error(D.draw(error))),
      (pluginOptions) =>
        RTE.run(
          createSchemaCustomizationProgram,
          buildDependencies(gatsbyContext, pluginOptions),
        ),
    ),
  )
