import * as gatsby from 'gatsby'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as Reader from 'fp-ts/Reader'
import * as IO from 'fp-ts/IO'
import * as Apply from 'fp-ts/Apply'
import { pipe } from 'fp-ts/function'

import { NodeHelpers } from './nodeHelpers'
import { PrismicSchema, PrismicTabSchema, PrismicFieldSchema } from '../types'

interface Dependencies {
  gatsbyBuildObjectType: gatsby.NodePluginSchema['buildObjectType']
  gatsbyCreateNodeId: gatsby.SourceNodesArgs['createNodeId']
  gatsbyCreateContentDigest: gatsby.SourceNodesArgs['createContentDigest']
  gatsbyCreateNode: gatsby.Actions['createNode']
  gatsbyCreateTypes: gatsby.Actions['createTypes']
  globalNodeHelpers: NodeHelpers
  nodeHelpers: NodeHelpers
  typePrefix?: string
}

const createType = <A extends gatsby.GatsbyGraphQLType>(
  type: A,
): Reader.Reader<Dependencies, IO.IO<A>> =>
  pipe(
    Reader.ask<Dependencies>(),
    Reader.map((deps) => () => {
      deps.gatsbyCreateTypes(type)
      return type
    }),
  )

const createTypes = <A extends gatsby.GatsbyGraphQLType[]>(
  ...types: A
): Reader.Reader<Dependencies, IO.IO<A>> =>
  pipe(
    Reader.ask<Dependencies>(),
    Reader.map((deps) => () => {
      deps.gatsbyCreateTypes(types)
      return types
    }),
  )

const buildObjectType = (
  config: Parameters<gatsby.NodePluginSchema['buildObjectType']>[0],
): Reader.Reader<Dependencies, IO.IO<gatsby.GatsbyGraphQLObjectType>> =>
  pipe(
    Reader.ask<Dependencies>(),
    Reader.map((deps) => () => deps.gatsbyBuildObjectType(config)),
  )

const sequenceSIO = Apply.sequenceS(IO.io)

const fieldSchemaToGatsbyGraphQLType2 = (
  fieldSchema: PrismicFieldSchema,
): Reader.Reader<Dependencies, IO.IO<string>> =>
  pipe(
    Reader.ask<Dependencies>(),
    Reader.map((deps) => {
      switch (fieldSchema.type) {
        case 'UID':
        case 'Text':
        case 'Color': {
          return IO.of('String')
        }

        case 'StructuredText': {
          return pipe(
            buildObjectType({
              name: deps.nodeHelpers.generateTypeName(fieldSchema.type),
              fields: {
                text: 'String',
                html: 'String',
                raw: 'JSON',
              },
              interfaces: [
                deps.globalNodeHelpers.generateTypeName(fieldSchema.type),
              ],
            }),
            Reader.map(IO.chain((x) => createType(x)(deps))),
            Reader.map(IO.map((type) => type.config.name)),
          )(deps)
        }
      }
    }),
  )

const fieldSchemaToGatsbyGraphQLType = (
  fieldSchema: PrismicFieldSchema,
): Reader.Reader<Dependencies, IO.IO<string>> => {
  switch (fieldSchema.type) {
    case 'UID':
    case 'Text':
    case 'Color': {
      return Reader.of(IO.of('String'))
    }

    case 'StructuredText': {
      return pipe(
        Reader.ask<Dependencies>(),
        Reader.chain((deps) =>
          buildObjectType({
            name: deps.nodeHelpers.generateTypeName(fieldSchema.type),
            fields: {
              text: 'String',
              html: 'String',
              raw: 'JSON',
            },
            interfaces: [
              deps.globalNodeHelpers.generateTypeName(fieldSchema.type),
            ],
          }),
        ),
        Reader.chain(IO.chain(createType)),
        Reader.map(IO.map((type) => type.config.name)),
      )
    }
  }
}

export const createSchemaTypes = (
  name: string,
  schema: PrismicSchema,
): Reader.Reader<Dependencies, IO.IO<string>> =>
  pipe(
    Reader.ask<Dependencies>(),
    Reader.map((deps) => {
      const { left: rootFields, right: dataFields } = pipe(
        schema,
        R.collect((_, value) => value),
        S.fold(S.getObjectSemigroup<PrismicTabSchema>())({}),
        R.map((field) => fieldSchemaToGatsbyGraphQLType(field)(deps)),
        sequenceSIO,
        IO.map(R.partitionWithIndex((i) => i !== 'uid')),
        IO.map(),
      )
      const dataType = buildObjectType({
        name: deps.nodeHelpers.generateTypeName(name, 'Data'),
        fields: dataFields,
      })(deps)
      const type = buildObjectType({
        name: deps.nodeHelpers.generateTypeName(name),
        fields: {
          ...rootFields,
          data: dataType.config.name,
        },
        interfaces: ['Node'],
      })(deps)

      return pipe(
        createTypes(type, dataType),
        IO.map((types) => types[0].config.name),
      )
    }),
  )
