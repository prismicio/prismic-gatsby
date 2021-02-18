import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as gatsbyImgix from 'gatsby-plugin-imgix'
import * as RE from 'fp-ts/ReaderEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { ProxyDocumentSubtreeEnv } from '../lib/proxyDocumentSubtree'
import { sprintf } from '../lib/sprintf'

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPIImageField =>
  typeof value === 'object' &&
  value !== null &&
  'url' in value &&
  'dimensions' in value

// TODO: Support image thumbnails
export const proxyValue = (
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
        gatsbyImgix.buildImgixFixed({
          url: env.url,
          sourceWidth: env.sourceWidth,
          sourceHeight: env.sourceHeight,
          args: env.args,
        }),
      ),
    ),
    RE.bind('fluid', (env) =>
      RE.of(
        gatsbyImgix.buildImgixFluid({
          url: env.url,
          sourceWidth: env.sourceWidth,
          sourceHeight: env.sourceHeight,
          args: env.args,
        }),
      ),
    ),
    RE.map((env) => ({
      ...fieldValue,
      fixed: env.fixed,
      fluid: env.fluid,
    })),
  )
