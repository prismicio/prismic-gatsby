import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, identity } from 'fp-ts/function'
import * as PrismicDOM from 'prismic-dom'

import { buildObjectType } from '../lib/buildObjectType'
import { createType } from '../lib/createType'
import { getTypeName } from '../lib/getTypeName'
import { createTypePath } from '../lib/createTypePath'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicAPIStructuredTextField,
  PrismicFieldType,
} from '../types'

export const buildStructuredTextFieldConfig: FieldConfigCreator = (path) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.StructuredText)),
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
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
  )
