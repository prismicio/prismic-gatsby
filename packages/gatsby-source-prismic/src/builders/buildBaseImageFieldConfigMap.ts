import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe, constNull } from 'fp-ts/function'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'

import { createRemoteFileNode } from '../lib/createRemoteFileNode'
import { getFromOrSetToCache } from '../lib/getFromOrSetToCache'
import { sprintf } from '../lib/sprintf'

import { LOCAL_FILE_CACHE_KEY_TEMPLATE } from '../constants'
import { Dependencies, PrismicAPIImageField } from '../types'

const resolveUrl = (source: PrismicAPIImageField) => source.url
const resolveWidth = (source: PrismicAPIImageField) => source.dimensions.width
const resolveHeight = (source: PrismicAPIImageField) => source.dimensions.height

const resolveLocalFileProgram = (
  source: PrismicAPIImageField,
): RTE.ReaderTaskEither<Dependencies, Error, string> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirstW(
      RTE.fromPredicate(
        (deps) => deps.pluginOptions.downloadLocal,
        () => new Error('downloadLocal is false'),
      ),
    ),
    RTE.bindW('url', () =>
      pipe(
        O.fromNullable(source.url),
        RTE.fromOption(() => new Error('URL is not set')),
      ),
    ),
    RTE.bind('cacheKey', (scope) =>
      RTE.of(sprintf(LOCAL_FILE_CACHE_KEY_TEMPLATE, scope.url)),
    ),
    RTE.chain((scope) =>
      getFromOrSetToCache(scope.cacheKey, createRemoteFileNode(scope.url)),
    ),
  )

export const buildBaseImageFieldConfigMap: RTE.ReaderTaskEither<
  Dependencies,
  never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    localFile: {
      type: 'File',
      resolve: async (source: PrismicAPIImageField) =>
        pipe(
          await RTE.run(resolveLocalFileProgram(source), scope),
          E.getOrElseW(constNull),
        ),
      extensions: { link: {} },
    },
  })),
)
