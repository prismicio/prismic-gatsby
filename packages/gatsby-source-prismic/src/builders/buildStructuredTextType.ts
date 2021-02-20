import * as gatsby from 'gatsby'
import * as PrismicDOM from 'prismic-dom'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'

import { Dependencies, PrismicAPIStructuredTextField } from '../types'

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
