import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import { pipe, identity } from 'fp-ts/function'

import { Dependencies } from 'gatsby-prismic-core'

import { PrismicContextState } from './usePrismicContext'
import { isGatsbyNodeInput } from './lib/isGatsbyNode'
import { isPlainObject } from './lib/isPlainObject'
import { isFunction } from './lib/isFunction'
import { isGatsbyGraphQLType } from './lib/isGatsbyGraphQLType'

type ProxyNodeDependencies = {
  types: PrismicContextState['types']
  nodes: PrismicContextState['nodes']
}

const getFieldsRecord = (type: gatsby.GatsbyGraphQLType) => {
  if ('fields' in type.config && type.config.fields) {
    const fields = type.config.fields

    return isPlainObject(fields) ? fields : fields()
  }

  return undefined
}

const getFieldType = (
  fieldConfig: string | gqlc.ComposeFieldConfig<unknown, unknown>,
): string => {
  if (typeof fieldConfig === 'string') return fieldConfig
  if (isPlainObject(fieldConfig)) {
    if (typeof fieldConfig.type === 'string') return fieldConfig.type
    if (isFunction(fieldConfig.type)) {
      const thunkValue = fieldConfig.type()
      if ('name' in thunkValue) return thunkValue.name
    }

    if ('name' in fieldConfig.type) return fieldConfig.type.name
  }
}

const isResolvableType = (
  type: any,
): type is { type: string; resolve: (source: unknown) => unknown } =>
  'type' in type && 'resolve' in type

// eslint-disable-next-line @typescript-eslint/ban-types
const proxify = <T extends object>(
  target: T,
  type?: gatsby.GatsbyGraphQLType,
): RTE.ReaderTaskEither<Dependencies & ProxyNodeDependencies, never, T> =>
  pipe(
    RTE.ask<Dependencies & ProxyNodeDependencies>(),
    RTE.map((deps) => {
      return new Proxy(target, {
        get: (target, prop, receiver) => {
          if (!type && isGatsbyNodeInput(target)) {
            type = deps.types[target.internal.type]
            if (type.kind === 'OBJECT') {
              const fields = getFieldsRecord(type)
              if (
                fields &&
                (typeof prop === 'string' || typeof prop === 'number')
              ) {
                let propType = fields[prop] as string | gatsby.GatsbyGraphQLType
                if (typeof propType === 'string')
                  propType = deps.types[propType]
                //if (isResolvableType(propType)) {
                //  //
                //} else if (typeof propType === 'string') {
                //  const registeredType = deps.types[propType]
                //}

                // if (typeof propType === 'string')
                //   propType = deps.types[propType] || propType

                // const resolver =
                //   isPlainObject(propType) && propType.resolve
                //     ? (propType.resolve as (source: typeof target) => unknown)
                //     : (source: typeof target) => source[prop]
                // const resolvedValue = resolver(target)

                // if (
                //   isPlainObject(resolvedValue) &&
                //   isGatsbyGraphQLType(propType)
                // )
                //   return proxify(resolvedValue, propType)

                // return proxify(resolvedValue, propType)
              }
            }
          }

          return Reflect.get(target, prop, receiver)
        },
      })
    }),
  )

// eslint-disable-next-line @typescript-eslint/ban-types
const getGetHandler = <T extends object>(
  parentType?: gatsby.GatsbyGraphQLType,
): RTE.ReaderTaskEither<
  Dependencies & ProxyNodeDependencies,
  never,
  ProxyHandler<T>['get']
> =>
  pipe(
    RTE.ask<Dependencies & ProxyNodeDependencies>(),
    RTE.map((deps) => (target, prop: string | number, receiver) =>
      pipe(
        target,
        O.fromPredicate(isGatsbyNodeInput),
        O.map((target) => {
          const type = deps.types[target.internal.type]
          const fields = getFieldsRecord(type)
          if (!fields) return Reflect.get(target, prop, receiver)

          const fieldType = fields[prop]
          const resolver =
            isPlainObject(fieldType) && fieldType.resolve
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (fieldType.resolve as (source: typeof target) => any)
              : (source: typeof target) => source[prop]
          const resolvedValue = resolver(target)

          return new Proxy(resolvedValue, { get: getGetHandler(fieldType) })
        }),
        O.getOrElse(() => Reflect.get(target, prop, receiver)),
      ),
    ),
  )

export const proxyNode = (
  node: gatsby.NodeInput,
): RTE.ReaderTaskEither<
  Dependencies & ProxyNodeDependencies,
  never,
  gatsby.NodeInput
> =>
  pipe(
    RTE.ask<Dependencies & ProxyNodeDependencies>(),
    RTE.bind('getHandler', () => getGetHandler<gatsby.NodeInput>()),
    RTE.map((scope) => new Proxy(node, { get: scope.getHandler })),
  )
