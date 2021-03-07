import * as gqlc from 'graphql-compose'
import * as gatsbyFs from 'gatsby-source-filesystem'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, PrismicAPIImageField } from '../types'

const resolveUrl = (source: PrismicAPIImageField): string | null => source.url

const resolveWidth = (source: PrismicAPIImageField): number | undefined =>
  source.dimensions?.width

const resolveHeight = (source: PrismicAPIImageField): number | undefined =>
  source.dimensions?.height

export const buildImageBaseFieldConfigMap: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfigMap<PrismicAPIImageField, unknown>
> = pipe(
  RTE.asks((deps) => ({
    alt: 'String',
    copyright: 'String',
    dimensions: deps.globalNodeHelpers.createTypeName('ImageDimensionsType'),
    url: gatsbyImgix.createImgixUrlFieldConfig({
      paramsInputType: deps.globalNodeHelpers.createTypeName(
        'ImgixUrlParamsInput',
      ),
      resolveUrl,
      defaultImgixParams: deps.pluginOptions.imageImgixParams,
    }),
    fixed: gatsbyImgix.createImgixFixedFieldConfig({
      type: deps.nodeHelpers.createTypeName('ImageFixedType'),
      paramsInputType: deps.globalNodeHelpers.createTypeName(
        'ImgixUrlParamsInput',
      ),
      resolveUrl,
      resolveWidth,
      resolveHeight,
      cache: deps.cache,
      defaultImgixParams: deps.pluginOptions.imageImgixParams,
      defaultPlaceholderImgixParams:
        deps.pluginOptions.imagePlaceholderImgixParams,
    }),
    fluid: gatsbyImgix.createImgixFluidFieldConfig({
      type: deps.nodeHelpers.createTypeName('ImageFluidType'),
      paramsInputType: deps.globalNodeHelpers.createTypeName(
        'ImgixUrlParamsInput',
      ),
      resolveUrl,
      resolveWidth,
      resolveHeight,
      cache: deps.cache,
      defaultImgixParams: deps.pluginOptions.imageImgixParams,
      defaultPlaceholderImgixParams:
        deps.pluginOptions.imagePlaceholderImgixParams,
    }),
    localFile: {
      type: 'File',
      resolve: async (
        source: PrismicAPIImageField,
      ): Promise<gatsbyFs.FileSystemNode | null> =>
        source.url
          ? await gatsbyFs.createRemoteFileNode({
              url: source.url,
              store: deps.store,
              cache: deps.cache,
              createNode: deps.createNode,
              createNodeId: deps.createNodeId,
              reporter: deps.reporter,
            })
          : null,
    },
  })),
)
