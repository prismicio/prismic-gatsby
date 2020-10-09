import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { PluginOptionsD } from 'shared/decoders'

import { sourceNodes as sourceNodesProgram } from './sourceNodes'
import { buildDependencies } from './buildDependencies'

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
