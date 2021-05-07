import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as imgixGatsby from '@imgix/gatsby'
import * as imgixGatsbyHelpers from '@imgix/gatsby/dist/pluginHelpers'
import * as RE from 'fp-ts/ReaderEither'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { ProxyDocumentSubtreeEnv } from '../lib/proxyDocumentSubtree'
import { refineFieldValue } from '../lib/refineFieldValue'
import { sprintf } from '../lib/sprintf'

import { PRISMIC_API_IMAGE_FIELDS } from '../constants'

interface ImageProxyValue extends gatsbyPrismic.PrismicAPIImageField {
  thumbnails: Record<string, gatsbyPrismic.PrismicAPIImageField>
}

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPIImageField =>
  // Unfortunately, we can't check for specific properties here since it's
  // possible for the object to be empty if an image was never set.
  typeof value === 'object' && value !== null

const buildImageProxyValue = (
  fieldValue: gatsbyPrismic.PrismicAPIImageField,
): RE.ReaderEither<
  ProxyDocumentSubtreeEnv,
  Error,
  gatsbyPrismic.PrismicAPIImageField
> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bindW('url', () =>
      pipe(
        O.fromNullable(fieldValue.url),
        RE.fromOption(() => new Error(sprintf('Missing image URL'))),
      ),
    ),
    RE.bindW('sourceWidth', () =>
      pipe(
        O.fromNullable(fieldValue.dimensions?.width),
        RE.fromOption(() => new Error(sprintf('Missing width'))),
      ),
    ),
    RE.bindW('sourceHeight', () =>
      pipe(
        O.fromNullable(fieldValue.dimensions?.height),
        RE.fromOption(() => new Error(sprintf('Missing height'))),
      ),
    ),
    RE.bind('args', (env) =>
      RE.of({
        imgixParams: env.imageImgixParams,
        placeholderImgixParams: env.imagePlaceholderImgixParams,
      }),
    ),
    RE.bind('fixed', (env) =>
      RE.of(
        imgixGatsby.buildFixedImageData(env.url, {
          ...env.args.imgixParams,
          w: env.sourceWidth,
          h: env.sourceHeight,
        }),
      ),
    ),
    RE.bind('fluid', (env) =>
      RE.of(
        imgixGatsby.buildFluidImageData(env.url, {
          ...env.args.imgixParams,
          ar: env.sourceWidth / env.sourceHeight,
        }),
      ),
    ),
    RE.bind('gatsbyImageData', (env) =>
      RE.of(
        imgixGatsbyHelpers.buildGatsbyImageDataObject({
          url: env.url,
          dimensions: { width: env.sourceWidth, height: env.sourceHeight },
          defaultParams: env.imageImgixParams,
          resolverArgs: {},
        }),
      ),
    ),
    RE.bind('localFile', (env) =>
      RE.of({
        childImageSharp: {
          fixed: env.fixed,
          fluid: env.fluid,
          gatsbyImageData: env.gatsbyImageData,
        },
      }),
    ),
    RE.map((env) => ({
      ...fieldValue,
      fixed: env.fixed,
      fluid: env.fluid,
      gatsbyImageData: env.gatsbyImageData,
      localFile: env.localFile,
    })),
    // If data is missing, we fall back to the original field value.
    RE.orElse(() => RE.of(fieldValue)),
  )

export const proxyValue = (
  fieldValue: gatsbyPrismic.PrismicAPIImageField,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, ImageProxyValue> =>
  pipe(
    fieldValue,
    R.partitionWithIndex((fieldName) =>
      PRISMIC_API_IMAGE_FIELDS.includes(fieldName),
    ),
    RE.of,
    RE.bind('baseFields', (fields) =>
      pipe(
        fields.right,
        refineFieldValue(valueRefinement, gatsbyPrismic.PrismicFieldType.Image),
        RE.chain((baseFields) => buildImageProxyValue(baseFields)),
      ),
    ),
    RE.bind('thumbnails', (fields) =>
      pipe(
        fields.left,
        R.map((thumbnailFields) =>
          pipe(
            thumbnailFields,
            refineFieldValue(
              valueRefinement,
              gatsbyPrismic.PrismicFieldType.Image,
            ),
            RE.chain((baseFields) => buildImageProxyValue(baseFields)),
          ),
        ),
        R.sequence(RE.Applicative),
      ),
    ),
    RE.map((scope) => ({
      ...scope.baseFields,
      thumbnails: scope.thumbnails,
    })),
  )
