import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'
import * as PrismicDOM from 'prismic-dom'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'

import {
  Dependencies,
  PrismicSchema,
  PrismicFieldSchema,
  PrismicSliceSchema,
  PrismicAPILinkField,
  PrismicAPIStructuredTextField,
  PrismicAPIDocumentNode,
  PrismicAPISliceField,
  PrismicAPIImageField,
} from './types'
import {
  PREVIEWABLE_NODE_ID_FIELD,
  PRISMIC_API_NON_DATA_FIELDS,
} from './constants'
import { listTypeName } from './lib/listTypeName'
import { dotPath } from './lib/dotPath'
import { getTypeName } from './lib/getTypeName'
import { sequenceSRTE } from './lib/sequenceSRTE'
import { reportInfo } from './lib/reportInfo'
import { buildObjectType } from './lib/buildObjectType'
import { buildUnionType } from './lib/buildUnionType'
import { registerType } from './lib/registerType'
import { registerTypes } from './lib/registerTypes'
import { buildInferredNodeType } from './lib/buildInferredNodeType'
import { buildNamedInferredNodeType } from './lib/buildNamedInferredNodeType'

const buildSchemaRecordType = (
  path: string[],
  record: Record<string, PrismicFieldSchema>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        buildSchemaRecordConfigMap(path, record),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(...path),
            fields,
          }),
        ),
      ),
    ),
  )

const buildSliceChoiceType = (
  path: string[],
  schema: PrismicSliceSchema,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        {} as Record<
          'primary' | 'items',
          RTE.ReaderTaskEither<
            Dependencies,
            never,
            gatsby.GatsbyGraphQLObjectType
          >
        >,
        R.isEmpty(schema['non-repeat'])
          ? identity
          : R.insertAt(
              'primary',
              buildSchemaRecordType(
                A.snoc(path, 'PrimaryType'),
                schema['non-repeat'],
              ),
            ),
        R.isEmpty(schema.repeat)
          ? identity
          : R.insertAt(
              'items',
              buildSchemaRecordType(A.snoc(path, 'ItemType'), schema.repeat),
            ),
        sequenceSRTE,
        RTE.chainFirst(
          flow(
            R.collect((_, type) => type),
            registerTypes,
          ),
        ),
        RTE.map(
          R.mapWithIndex((field, type) =>
            field === 'items'
              ? pipe(type, getTypeName, listTypeName)
              : getTypeName(type),
          ),
        ),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(...path),
            fields: {
              ...fields,
              slice_type: 'String!',
              slice_label: 'String',
            },
            extensions: { infer: false },
          }),
        ),
      ),
    ),
  )

const buildSliceTypes = (
  path: string[],
  choices: Record<string, PrismicSliceSchema>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    choices,
    R.mapWithIndex((sliceName, sliceSchema) =>
      buildSliceChoiceType(A.snoc(path, sliceName), sliceSchema),
    ),
    sequenceSRTE,
    RTE.map(R.collect((_, type) => type)),
  )

const toFieldConfig = <TSource, TContext>(
  path: string[],
  schema: PrismicFieldSchema,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfig<TSource, TContext>
> => {
  switch (schema.type) {
    case 'Color':
    case 'Select':
    case 'Text':
    case 'UID': {
      return RTE.of('String')
    }

    case 'Boolean': {
      return RTE.of('Boolean')
    }

    case 'Number': {
      return RTE.of('Float')
    }

    case 'Date':
    case 'Timestamp': {
      return RTE.of({ type: 'Date', extensions: { dateformat: {} } })
    }

    case 'StructuredText': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildObjectType({
              name: deps.globalNodeHelpers.createTypeName('StructuredTextType'),
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
                      deps.pluginOptions.linkResolver?.(),
                      deps.pluginOptions.htmlSerializer?.(),
                    ),
                },
                raw: { type: 'JSON', resolve: identity },
              },
            }),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    case 'GeoPoint': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildObjectType({
              name: deps.globalNodeHelpers.createTypeName('GeoPointType'),
              fields: {
                longitude: 'Float',
                latitude: 'Float',
              },
            }),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    case 'Embed': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildNamedInferredNodeType(
              deps.globalNodeHelpers.createTypeName('EmbedType'),
            ),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    // TODO: Support thumbnails in a `thumnails` field. `scope.imageFields` has
    // already been setup to be shared between both PrismicImageType and
    // PrismicImageThumbnailType.
    case 'Image': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            RTE.right({
              resolveUrl: (source: PrismicAPIImageField) => source.url,
              resolveWidth: (source: PrismicAPIImageField) =>
                source.dimensions.width,
              resolveHeight: (source: PrismicAPIImageField) =>
                source.dimensions.height,
              fixedType: gatsbyImgix.createImgixFixedType({
                name: deps.nodeHelpers.createTypeName('ImageFixedType'),
                cache: deps.cache,
              }),
              fluidType: gatsbyImgix.createImgixFluidType({
                name: deps.nodeHelpers.createTypeName('ImageFluidType'),
                cache: deps.cache,
              }),
            }),
            RTE.bind('imageFields', (scope) =>
              RTE.of({
                alt: 'String',
                copyright: 'String',
                dimensions: deps.globalNodeHelpers.createTypeName(
                  'ImageDimensionsType',
                ),
                url: gatsbyImgix.createImgixUrlSchemaFieldConfig({
                  resolveUrl: scope.resolveUrl,
                  defaultImgixParams: deps.pluginOptions.imageImgixParams,
                }),
                fixed: gatsbyImgix.createImgixFixedSchemaFieldConfig({
                  type: scope.fixedType,
                  resolveUrl: scope.resolveUrl,
                  resolveWidth: scope.resolveWidth,
                  resolveHeight: scope.resolveHeight,
                  cache: deps.cache,
                  defaultImgixParams: deps.pluginOptions.imageImgixParams,
                  defaultPlaceholderImgixParams:
                    deps.pluginOptions.imagePlaceholderImgixParams,
                }),
                fluid: gatsbyImgix.createImgixFluidSchemaFieldConfig({
                  type: scope.fluidType,
                  resolveUrl: scope.resolveUrl,
                  resolveWidth: scope.resolveWidth,
                  resolveHeight: scope.resolveHeight,
                  cache: deps.cache,
                  defaultImgixParams: deps.pluginOptions.imageImgixParams,
                  defaultPlaceholderImgixParams:
                    deps.pluginOptions.imagePlaceholderImgixParams,
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
                name: deps.nodeHelpers.createTypeName('ImageType'),
                fields: scope.imageFields,
              }),
            ),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    case 'Link': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildObjectType({
              name: deps.nodeHelpers.createTypeName('LinkType'),
              fields: {
                link_type: deps.globalNodeHelpers.createTypeName('LinkTypes'),
                isBroken: 'Boolean',
                url: {
                  type: 'String',
                  resolve: (source: PrismicAPILinkField) =>
                    PrismicDOM.Link.url(
                      source,
                      deps.pluginOptions.linkResolver?.(),
                    ),
                },
                target: 'String',
                size: 'Int',
                id: 'ID',
                type: 'String',
                tags: '[String]',
                lang: 'String',
                slug: 'String',
                uid: 'String',
                document: {
                  type: deps.nodeHelpers.createTypeName('AllDocumentTypes'),
                  resolve: (source: PrismicAPILinkField) =>
                    source.link_type === 'Document' &&
                    source.type &&
                    source.id &&
                    !source.isBroken
                      ? deps.nodeHelpers.createNodeId(source.id)
                      : undefined,
                  extensions: { link: {} },
                },
                raw: { type: 'JSON', resolve: identity },
              },
            }),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    case 'Group': {
      return pipe(
        buildSchemaRecordType(A.snoc(path, 'GroupType'), schema.config.fields),
        RTE.chainFirst(registerType),
        RTE.map(getTypeName),
        RTE.map(listTypeName),
      )
    }

    case 'Slices': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildSliceTypes(path, schema.config.choices),
            RTE.chainFirst(registerTypes),
            RTE.map(A.map(getTypeName)),
            RTE.chain((types) =>
              buildUnionType({
                name: deps.nodeHelpers.createTypeName(...path, 'SlicesType'),
                types,
                resolveType: (source: PrismicAPISliceField) =>
                  deps.nodeHelpers.createTypeName(...path, source.slice_type),
              }),
            ),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
            RTE.map(listTypeName),
          ),
        ),
      )
    }

    default:
      return pipe(
        reportInfo(
          // @ts-expect-error - `schema.type` cannot be known here since this
          // block would only be reached if an unsupported field type was
          // introduced.
          `An unknown field type "${schema.type}" was found at ${dotPath(
            path,
          )}. A generic inferred node type will be created. If the underlying type is not an object, manually override the type using Gatsby's createSchemaCustomization API in your site's gatsby-node.js.`,
        ),
        RTE.chain(() => buildInferredNodeType(path)),
        RTE.chainFirst(registerType),
        RTE.map(getTypeName),
      )
  }
}

const buildSchemaRecordConfigMap = <TSource, TContext>(
  path: string[],
  record: Record<string, PrismicFieldSchema>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfigMap<TSource, TContext>
> =>
  pipe(
    record,
    R.mapWithIndex((name, schema) =>
      toFieldConfig<TSource, TContext>(A.snoc(path, name), schema),
    ),
    sequenceSRTE,
  )

const collectFields = (
  schema: PrismicSchema,
): Record<string, PrismicFieldSchema> =>
  pipe(
    schema,
    R.collect((_, value) => value),
    S.fold(S.getObjectSemigroup<Record<string, PrismicFieldSchema>>())({}),
  )

const registerCustomType = (
  name: string,
  schema: PrismicSchema,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        schema,
        collectFields,
        (record) => buildSchemaRecordConfigMap([name], record),
        RTE.map(
          R.partitionWithIndex((i) => !PRISMIC_API_NON_DATA_FIELDS.includes(i)),
        ),
        RTE.bind('data', (fields) =>
          pipe(
            buildObjectType({
              name: deps.nodeHelpers.createTypeName(name, 'DataType'),
              fields: fields.right,
            }),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(name),
            fields: {
              ...fields.left,
              // Need to type cast the property name so TypeScript can
              // statically analize the object keys.
              // TODO: May be fixable with TypeScript 4.1's Template Literal
              // Types.
              [deps.nodeHelpers.createFieldName('id') as 'id']: 'ID!',
              data: fields.data,
              dataRaw: { type: 'JSON!', resolve: identity },
              first_publication_date: {
                type: 'Date!',
                extensions: { dateformat: {} },
              },
              href: 'String!',
              lang: 'String!',
              last_publication_date: {
                type: 'Date!',
                extensions: { dateformat: {} },
              },
              tags: '[String!]!',
              type: 'String!',
              url: {
                type: 'String',
                resolve: (source: PrismicAPIDocumentNode) =>
                  deps.pluginOptions.linkResolver?.()?.(source),
              },
              [PREVIEWABLE_NODE_ID_FIELD]: {
                type: 'ID!',
                resolve: (source: PrismicAPIDocumentNode) =>
                  source[deps.nodeHelpers.createFieldName('id')],
              },
            },
            interfaces: ['Node'],
            extensions: { infer: false },
          }),
        ),
        RTE.chainFirst(registerType),
      ),
    ),
  )

export const registerCustomTypes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        deps.pluginOptions.schemas,
        R.mapWithIndex(registerCustomType),
        sequenceSRTE,
        RTE.map(R.collect((_, value) => value)),
      ),
    ),
  )
