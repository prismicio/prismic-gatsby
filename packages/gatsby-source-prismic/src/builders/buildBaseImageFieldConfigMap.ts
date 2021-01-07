import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'

import { Dependencies, PrismicAPIImageField } from '../types'

const resolveUrl = (source: PrismicAPIImageField) => source.url
const resolveWidth = (source: PrismicAPIImageField) => source.dimensions.width
const resolveHeight = (source: PrismicAPIImageField) => source.dimensions.height

export const buildBaseImageFieldConfigMap: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfigMap<any, any>
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('fixedType', (scope) =>
    RTE.of(
      gatsbyImgix.createImgixFixedType({
        name: scope.nodeHelpers.createTypeName('ImageFixedType'),
        cache: scope.cache,
      }),
    ),
  ),
  RTE.bind('fluidType', (scope) =>
    RTE.of(
      gatsbyImgix.createImgixFluidType({
        name: scope.nodeHelpers.createTypeName('ImageFluidType'),
        cache: scope.cache,
      }),
    ),
  ),
  RTE.map((scope) => ({
    alt: 'String',
    copyright: 'String',
    dimensions: scope.globalNodeHelpers.createTypeName('ImageDimensionsType'),
    url: gatsbyImgix.createImgixUrlSchemaFieldConfig({
      resolveUrl,
      defaultImgixParams: scope.pluginOptions.imageImgixParams,
    }),
    fixed: gatsbyImgix.createImgixFixedSchemaFieldConfig({
      type: scope.fixedType,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      cache: scope.cache,
      defaultImgixParams: scope.pluginOptions.imageImgixParams,
      defaultPlaceholderImgixParams:
        scope.pluginOptions.imagePlaceholderImgixParams,
    }),
    fluid: gatsbyImgix.createImgixFluidSchemaFieldConfig({
      type: scope.fluidType,
      resolveUrl,
      resolveWidth,
      resolveHeight,
      cache: scope.cache,
      defaultImgixParams: scope.pluginOptions.imageImgixParams,
      defaultPlaceholderImgixParams:
        scope.pluginOptions.imagePlaceholderImgixParams,
    }),
    // TODO: Create resolver that downloads the file, creates a
    // node, and returns the ID. This can be handled using
    // gatsby-source-filesystem's helper functions.
    localFile: {
      type: 'File',
      resolve: (_source: PrismicAPIImageField) => {},
      extensions: { link: {} },
    },
  })),
)
