import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as A from 'fp-ts/Array'
import * as Ap from 'fp-ts/Apply'
import { pipe } from 'fp-ts/function'

import { PrismicSchema, PrismicFieldSchema } from '../types'
import { NodeHelpers } from './nodeHelpers'
import { listTypeName } from './listTypeName'

interface Dependencies {
  gatsbyCreateType: gatsby.Actions['createTypes']
  gatsbyBuildObjectType: gatsby.NodePluginSchema['buildObjectType']
  gatsbyBuildUnionType: gatsby.NodePluginSchema['buildUnionType']
  gatsbyReportInfo: gatsby.Reporter['info']
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
}

const reportInfo = (
  text: string,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyReportInfo(text)),
  )

const buildObjectType = <TSource, TContext>(
  config: gqlc.ComposeObjectTypeConfig<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyBuildObjectType(config)),
  )

const buildUnionType = (
  name: string,
  types: string[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyBuildUnionType({ name, types })),
  )

const registerType = <A extends gatsby.GatsbyGraphQLType>(
  type: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyCreateType(type)),
  )

const registerTypes = <A extends gatsby.GatsbyGraphQLType[]>(
  types: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyCreateType(types)),
  )

const getTypeName = (type: gatsby.GatsbyGraphQLType): string => type.config.name

const drawPath = (path: string[]) => path.join('.')

const collectFields = (
  schema: PrismicSchema,
): Record<string, PrismicFieldSchema> =>
  pipe(
    schema,
    R.collect((_, value) => value),
    S.fold(S.getObjectSemigroup<Record<string, PrismicFieldSchema>>())({}),
  )

const partitionDataFields = R.partitionWithIndex((i) => i !== 'uid')

// const registerStructuredTextType = (schema: PrismicFieldSchema) =>
//   pipe(
//     Rr.ask<Dependencies>(),
//     Rr.map((deps) =>
//       deps.gatsbyBuildObjectType({
//         name: deps.nodeHelpers.generateTypeName(schema.type),
//         fields: {
//           text: 'String',
//           html: 'String',
//           raw: 'JSON',
//         },
//         interfaces: [deps.globalNodeHelpers.generateTypeName(schema.type)],
//       }),
//     ),
//     Rr.chain(registerType),
//   )

// TODO: Replace with a generic `buildNamedInferredNodeType`
const buildEmbedType = (
  schema: PrismicFieldSchema,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      deps.gatsbyBuildObjectType({
        name: deps.globalNodeHelpers.generateTypeName(schema.type),
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    ),
  )

const buildGroupType = (
  path: string[],
  schema: PrismicFieldSchema & { type: 'Group' },
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        recordToFieldConfigMap(path, schema.config.fields),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.generateTypeName(...path, 'GroupType'),
            fields,
          }),
        ),
      ),
    ),
  )

const sequenceSRTE = Ap.sequenceS(RTE.readerTaskEither)

const sequenceTRTE = Ap.sequenceT(RTE.readerTaskEither)

const buildSliceTypes = (
  path: string[],
  schema: PrismicFieldSchema & { type: 'Slices' },
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    schema.config.choices,
    R.mapWithIndex(
      (sliceName, sliceSchema) =>
        [
          recordToFieldConfigMap(
            A.snoc(path, sliceName),
            sliceSchema['non-repeat'],
          ),
          recordToFieldConfigMap(A.snoc(path, sliceName), sliceSchema.repeat),
        ] as const,
    ),

    // TODO: Good morning!
    //
    // 1. Be given a slicezone schema.
    // 2. For each slice choice in the schema, create a type (make a buildSliceChoiceType function)
    //    - This new function will need to make several types:
    //        a) repeat object type (i.e. "items")
    //        b) non-repeat object type (i.e. "repeat")
    //        c) the root type that uses those two
    // 3. Return all the new types as an array

    // sequenceSRTE,
    // RTE.map(x=>x)
  )
// TODO - Given a slicezone schema, build a list of all the slice GraphQL types

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

const registerSchemaType = <TSource, TContext>(
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
      // return pipe(schema, registerStructuredTextType, RTE.map(getTypeName))
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.map((deps) =>
          deps.globalNodeHelpers.generateTypeName('StructuredText'),
        ),
      )
    }

    case 'GeoPoint': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.map((deps) => deps.globalNodeHelpers.generateTypeName('GeoPoint')),
      )
    }

    case 'Embed': {
      return pipe(
        schema,
        buildEmbedType,
        RTE.chainFirst(registerType),
        RTE.map(getTypeName),
      )
    }

    // case 'Image': {
    // }

    case 'Link': {
      return pipe(
        RTE.ask<Dependencies>(),
        RTE.map((deps) => deps.globalNodeHelpers.generateTypeName('Link')),
      )
    }

    case 'Group': {
      return pipe(
        buildGroupType(path, schema),
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
            buildSliceTypes(path, schema),
            RTE.chainFirst(registerTypes),
            RTE.map(A.map(getTypeName)),
            RTE.chain((types) =>
              buildUnionType(
                deps.nodeHelpers.generateTypeName(...path, 'SlicesType'),
                types,
              ),
            ),
            RTE.map(getTypeName),
            RTE.map(listTypeName),
          ),
        ),
      )
    }

    default:
      return pipe(
        reportInfo(
          `An unknown field type "${schema.type}" was found at ${drawPath(
            path,
          )}. A generic inferred node type will be created. If the underlying type is not an object, manually override the type using Gatsby's createSchemaCustomization API in your gatsby-node.js.`,
        ),
        RTE.chain(() => buildInferredNodeType(path)),
        RTE.chainFirst(registerType),
        RTE.map(getTypeName),
      )
  }
}

const recordToFieldConfigMap = <TSource, TContext>(
  path: string[],
  record: Record<string, PrismicFieldSchema>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gqlc.ComposeFieldConfigMap<TSource, TContext>
> =>
  pipe(
    record,
    R.map((schema) => registerSchemaType<TSource, TContext>(path, schema)),
    sequenceSRTE,
  )
