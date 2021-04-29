import * as gatsby from 'gatsby'
import * as PrismicDOM from 'prismic-dom'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'

import { Dependencies, PrismicAPIStructuredTextField } from '../types'

/**
 * Builds a GraphQL Type used by StructuredText fields. The resulting type can
 * be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildStructuredTextType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.nodeHelpers.createTypeName('StructuredTextType'),
      fields: {
        text: {
          type: 'String',
          resolve: (source: PrismicAPIStructuredTextField) =>
            PrismicDOM.RichText.asText(source),
        },
        html: {
          type: 'String',
          resolve: (source: PrismicAPIStructuredTextField) =>
            PrismicDOM.RichText.asHtml(
              source,
              deps.pluginOptions.linkResolver,
              deps.pluginOptions.htmlSerializer,
            ),
        },
        raw: { type: 'JSON', resolve: identity },
      },
    }),
  ),
)
