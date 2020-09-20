import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as A from 'fp-ts/Array'
import { pipe, flow } from 'fp-ts/function'

import {
  Dependencies,
  PrismicSchema,
  PrismicFieldSchema,
  PrismicSliceSchema,
} from './types'
import { NON_DATA_FIELDS, REPORTER_TEMPLATE } from './constants'
import { listTypeName } from './lib/listTypeName'
import { dotPath } from './lib/dotPath'
import { getTypeName } from './lib/getTypeName'
import { sequenceSRTE } from './lib/sequenceSRTE'
import { sprintf } from 'lib/sprintf'

const reportInfo = (
  text: string,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      pipe(
        sprintf(REPORTER_TEMPLATE, deps.pluginOptions.repositoryName, text),
        deps.gatsbyReportInfo,
      ),
    ),
  )

const buildObjectType = <TSource, TContext>(
  config: gqlc.ComposeObjectTypeConfig<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyBuildObjectType(config)),
  )

const buildUnionType = <TSource, TContext>(
  config: gqlc.ComposeUnionTypeConfig<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyBuildUnionType(config)),
  )

const registerType = <A extends gatsby.GatsbyGraphQLType>(
  type: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyCreateTypes(type)),
  )

const registerTypes = <A extends gatsby.GatsbyGraphQLType[]>(
  types: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyCreateTypes(types)),
  )

const buildNamedInferredNodeType = (
  name: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      deps.gatsbyBuildObjectType({
        name,
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    ),
  )

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
            name: deps.nodeHelpers.generateTypeName(...path),
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
        {
          primary: buildSchemaRecordType(
            A.snoc(path, 'PrimaryType'),
            schema['non-repeat'],
          ),
          items: buildSchemaRecordType(A.snoc(path, 'ItemType'), schema.repeat),
        },
        sequenceSRTE,
        RTE.chainFirst(
          flow(
            R.collect((_, type) => type),
            registerTypes,
          ),
        ),
        RTE.map(R.map(getTypeName)),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.generateTypeName(...path),
            fields,
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

const buildInferredNodeType = (
  path: string[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        buildObjectType({
          name: deps.nodeHelpers.generateTypeName(...path),
          interfaces: ['Node'],
          extensions: { infer: true },
        }),
      ),
    ),
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
              name: deps.globalNodeHelpers.generateTypeName(
                'StructuredTextType',
              ),
              fields: {
                text: 'String',
                html: 'String',
                raw: 'JSON',
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
              name: deps.globalNodeHelpers.generateTypeName('GeoPointType'),
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
              deps.globalNodeHelpers.generateTypeName('EmbedType'),
            ),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
      )
    }

    // TODO
    // case 'Image': {
    // }

    case 'Link': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.chain((deps) =>
          pipe(
            buildObjectType({
              name: deps.nodeHelpers.generateTypeName('LinkType'),
              fields: {
                link_type: deps.globalNodeHelpers.generateTypeName('LinkTypes'),
                isBroken: 'Boolean',
                url: 'String',
                target: 'String',
                size: 'Int',
                id: 'ID',
                type: 'String',
                tags: '[String]',
                lang: 'String',
                slug: 'String',
                uid: 'String',
                document: {
                  type: deps.nodeHelpers.generateTypeName('AllDocumentTypes'),
                  extensions: { link: {} },
                },
                raw: 'JSON',
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
                name: deps.nodeHelpers.generateTypeName(...path, 'SlicesType'),
                types,
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
          `An unknown field type "${schema.type}" was found at ${dotPath(
            path,
          )}. A generic inferred node type will be created. If the underlying type is not an object, manually override the type using Gatsby's createSchemaCustomization API in your gatsby-node.js.`,
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
    R.map((schema) => toFieldConfig<TSource, TContext>(path, schema)),
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

export const registerCustomType = <TSource, TContext>(
  name: string,
  schema: PrismicSchema,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        schema,
        collectFields,
        (record) =>
          buildSchemaRecordConfigMap<TSource, TContext>([name], record),
        RTE.map(R.partitionWithIndex((i) => !NON_DATA_FIELDS.includes(i))),
        RTE.bind('data', (fields) =>
          pipe(
            buildObjectType({
              name: deps.nodeHelpers.generateTypeName(name, 'DataType'),
              fields: fields.right,
            }),
            RTE.chainFirst(registerType),
            RTE.map(getTypeName),
          ),
        ),
        RTE.chain((fields) =>
          buildObjectType<TSource, TContext>({
            name: deps.nodeHelpers.generateTypeName(name),
            fields: { ...fields.left, data: fields.data },
            interfaces: ['Node'],
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

export const registerAllDocumentTypes = (
  types: gatsby.GatsbyGraphQLObjectType[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        types,
        A.map(getTypeName),
        (types) =>
          buildUnionType({
            name: deps.nodeHelpers.generateTypeName('AllDocumentTypes'),
            types,
          }),
        RTE.chainFirst(registerType),
      ),
    ),
  )
