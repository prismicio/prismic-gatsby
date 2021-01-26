// import * as gatsbyPrismic from 'gatsby-source-prismic'
// import * as RTE from 'fp-ts/ReaderTaskEither'
// import { pipe, Predicate } from 'fp-ts/function'
// import * as F from 'fp-ts-std/Function'
// import { UnknownRecord } from '../types'

// export interface BuildLinkFieldProxyEnv {}

// export const buildLinkFieldProxy = <
//   T extends gatsbyPrismic.PrismicAPILinkField
// >(
//   value: T,
// ): RTE.ReaderTaskEither<BuildLinkFieldProxyEnv, Error, T> => pipe()

// buildProxy({ foo: 'bar' } as const, {
//   foo: (x) => x,
// })

// const buildProxy = <A extends UnknownRecord, K extends keyof A | string>(
//   target: A,
//   interceptors: Record<K, (x: A[K]) => A[K]>,
// ): A =>
//   new Proxy(target, {
//     get: (target, prop: K, receiver) => {
//       const interceptor = interceptors[prop]
//       if (interceptor) {
//         return interceptor(target[prop])
//       }

//       return Reflect.get(target, prop, receiver)
//     },
//   })
