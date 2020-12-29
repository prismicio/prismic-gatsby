import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'

import { buildObjectType } from '../lib/buildObjectType'
import { getTypeName } from '../lib/getTypeName'
import { registerType } from '../lib/registerType'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicAPIImageField,
} from '../types'

const resolveUrl = (source: PrismicAPIImageField) => source.url
const resolveWidth = (source: PrismicAPIImageField) => source.dimensions.width
const resolveHeight = (source: PrismicAPIImageField) => source.dimensions.height

// TODO: Support thumbnails
export const createImageFieldConfig: FieldConfigCreator = () =>
  pipe(
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
    RTE.bind('imageFields', (scope) =>
      RTE.of({
        alt: 'String',
        copyright: 'String',
        dimensions: scope.globalNodeHelpers.createTypeName(
          'ImageDimensionsType',
        ),
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
          extensions: { link: {} },
        },
      }),
    ),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName('ImageType'),
        fields: scope.imageFields,
      }),
    ),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )
