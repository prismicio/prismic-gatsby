import * as gatsby from 'gatsby'
// import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
// import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import * as PrismicDOM from 'prismic-dom'
import {
  PrismicAPIDocumentNode,
  PrismicAPILinkField,
  PrismicFieldType,
} from 'gatsby-source-prismic'

import { PrismicContextState } from './usePrismicContext'
import { isGatsbyNodeInput } from './lib/isGatsbyNode'
import { isPlainObject } from './lib/isPlainObject'
import { isFunction } from './lib/isFunction'
import { isGatsbyGraphQLType } from './lib/isGatsbyGraphQLType'
import { Dependencies, UnknownRecord } from './types'

//const getFieldsRecord = (type: gatsby.GatsbyGraphQLType) => {
//  if ('fields' in type.config && type.config.fields) {
//    const fields = type.config.fields

//    return isPlainObject(fields) ? fields : fields()
//  }

//  return undefined
//}

//const getFieldType = (
//  fieldConfig: string | gqlc.ComposeFieldConfig<unknown, unknown>,
//): string => {
//  if (typeof fieldConfig === 'string') return fieldConfig
//  if (isPlainObject(fieldConfig)) {
//    if (typeof fieldConfig.type === 'string') return fieldConfig.type
//    if (isFunction(fieldConfig.type)) {
//      const thunkValue = fieldConfig.type()
//      if ('name' in thunkValue) return thunkValue.name
//    }

//    if ('name' in fieldConfig.type) return fieldConfig.type.name
//  }
//}

//const isResolvableType = (
//  type: any,
//): type is { type: string; resolve: (source: unknown) => unknown } =>
//  'type' in type && 'resolve' in type

//// eslint-disable-next-line @typescript-eslint/ban-types
//const proxify = <T extends object>(
//  target: T,
//  type?: gatsby.GatsbyGraphQLType,
//): RTE.ReaderTaskEither<Dependencies & ProxyNodeDependencies, never, T> =>
//  pipe(
//    RTE.ask<Dependencies & ProxyNodeDependencies>(),
//    RTE.map((deps) => {
//      return new Proxy(target, {
//        get: (target, prop, receiver) => {
//          if (!type && isGatsbyNodeInput(target)) {
//            type = deps.types[target.internal.type]
//            if (type.kind === 'OBJECT') {
//              const fields = getFieldsRecord(type)
//              if (
//                fields &&
//                (typeof prop === 'string' || typeof prop === 'number')
//              ) {
//                let propType = fields[prop] as string | gatsby.GatsbyGraphQLType
//                if (typeof propType === 'string')
//                  propType = deps.types[propType]
//                //if (isResolvableType(propType)) {
//                //  //
//                //} else if (typeof propType === 'string') {
//                //  const registeredType = deps.types[propType]
//                //}

//                // if (typeof propType === 'string')
//                //   propType = deps.types[propType] || propType

//                // const resolver =
//                //   isPlainObject(propType) && propType.resolve
//                //     ? (propType.resolve as (source: typeof target) => unknown)
//                //     : (source: typeof target) => source[prop]
//                // const resolvedValue = resolver(target)

//                // if (
//                //   isPlainObject(resolvedValue) &&
//                //   isGatsbyGraphQLType(propType)
//                // )
//                //   return proxify(resolvedValue, propType)

//                // return proxify(resolvedValue, propType)
//              }
//            }
//          }

//          return Reflect.get(target, prop, receiver)
//        },
//      })
//    }),
//  )

//// eslint-disable-next-line @typescript-eslint/ban-types
//const getGetHandler = <T extends object>(
//  parentType?: gatsby.GatsbyGraphQLType,
//): RTE.ReaderTaskEither<
//  Dependencies & ProxyNodeDependencies,
//  never,
//  ProxyHandler<T>['get']
//> =>
//  pipe(
//    RTE.ask<Dependencies & ProxyNodeDependencies>(),
//    RTE.map((deps) => (target, prop: string | number, receiver) =>
//      pipe(
//        target,
//        O.fromPredicate(isGatsbyNodeInput),
//        O.map((target) => {
//          const type = deps.types[target.internal.type]
//          const fields = getFieldsRecord(type)
//          if (!fields) return Reflect.get(target, prop, receiver)

//          const fieldType = fields[prop]
//          const resolver =
//            isPlainObject(fieldType) && fieldType.resolve
//              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                (fieldType.resolve as (source: typeof target) => any)
//              : (source: typeof target) => source[prop]
//          const resolvedValue = resolver(target)

//          return new Proxy(resolvedValue, { get: getGetHandler(fieldType) })
//        }),
//        O.getOrElse(() => Reflect.get(target, prop, receiver)),
//      ),
//    ),
//  )

const proxySubNode = <T extends UnknownRecord | UnknownRecord[]>(
  path: string[],
  subNode: T,
) =>
  // ): RTE.ReaderTaskEither<Dependencies, never, T> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map(
      (scope) =>
        new Proxy(subNode, {
          get: (target, prop, receiver) => {
            if (typeof prop !== 'string' || typeof prop !== 'number') {
              return Reflect.get(target, prop, receiver)
            }

            const type = scope.getFieldType([...path, prop])
            const propValue = target[prop]

            switch (type) {
              case PrismicFieldType.Color:
              case PrismicFieldType.Select:
              case PrismicFieldType.Text:
              case PrismicFieldType.UID: {
                return propValue.toString()
              }

              case PrismicFieldType.Boolean: {
                return Boolean(propValue)
              }

              case PrismicFieldType.Number: {
                return propValue
              }

              case PrismicFieldType.Date:
              case PrismicFieldType.Timestamp: {
                return propValue
              }

              case PrismicFieldType.StructuredText: {
                return {
                  text: PrismicDOM.RichText.asText(propValue),
                  html: PrismicDOM.RichText.asHtml(
                    propValue,
                    scope.pluginOptions.linkResolver,
                    scope.pluginOptions.htmlSerializer,
                  ),
                  raw: propValue,
                }
              }

              case PrismicFieldType.GeoPoint: {
                return propValue
              }

              case PrismicFieldType.Embed: {
                return propValue
              }

              case PrismicFieldType.Image: {
                // TODO
                return propValue
              }

              case PrismicFieldType.Link: {
                const value = propValue as PrismicAPILinkField

                const baseFields = {
                  ...(value as PrismicAPILinkField),
                  url: PrismicDOM.Link.url(
                    propValue,
                    scope.pluginOptions.linkResolver,
                  ),
                  raw: value,
                }

                if (
                  value.link_type === 'Document' &&
                  !value.isBroken &&
                  value.id
                ) {
                  const documentNodeId = scope.nodeHelpers.createNodeId(
                    value.id,
                  )
                  const documentNode = scope.getNode(
                    documentNodeId,
                  ) as PrismicAPIDocumentNode

                  return {
                    ...baseFields,
                    document: proxyPrismicDocumentNode(documentNode),
                  }
                }
              }

              case PrismicFieldType.Group: {
                const value = propValue as UnknownRecord[]

                return value.map((item) =>
                  proxySubNode([...path, 'GroupType'], item),
                )
              }

              case PrismicFieldType.Slices: {
                const value = propValue as UnknownRecord[]

                return value.map((item) =>
                  proxySubNode([...path, 'SlicesType']),
                )
              }

              default: {
                return Reflect.get(target, prop, receiver)
              }
            }
          },
        }),
    ),
  )

export const proxyPrismicDocumentNode = <T extends PrismicAPIDocumentNode>(
  node: T,
): RTE.ReaderTaskEither<Dependencies, never, T> =>
  proxySubNode([node.type], node)
