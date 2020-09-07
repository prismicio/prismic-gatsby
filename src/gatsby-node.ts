import * as gatsby from 'gatsby'
import * as E from 'fp-ts/Either'
import { pipe, identity } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { schemaToTypeDef } from './lib/schemaToTypeDef'
import { PluginOptionsC } from './decoders'

export const sourceNodes: NonNullable<
  gatsby.GatsbyNode['sourceNodes']
> = async (
  gatsbyContext: gatsby.SourceNodesArgs,
  rawPluginOptions: unknown,
) => {
  const pluginOptions = pipe(
    PluginOptionsC.decode(rawPluginOptions),
    E.fold((e) => gatsbyContext.reporter.panic(D.draw(e)), identity),
  )

  const typeDef = schemaToTypeDef('page', pluginOptions.schemas.page)
}
