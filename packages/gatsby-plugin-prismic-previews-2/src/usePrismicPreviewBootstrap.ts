// TODO
//
// The following was copied from usePrismicPreviewResolver

// import * as React from 'react'
// import * as gatsby from 'gatsby'
// import * as cookie from 'es-cookie'
// import * as RTE from 'fp-ts/ReaderTaskEither'
// import * as TE from 'fp-ts/TaskEither'
// import * as E from 'fp-ts/Either'
// import { constVoid, pipe } from 'fp-ts/function'
// import Prismic from 'prismic-javascript'

// import { getURLSearchParam } from './lib/getURLSearchParam'
// import { createClient, CreateClientEnv } from './lib/createClient'
// import { UnauthorizedError } from './errors/NotAuthorizedError'

// import { LinkResolver, PrismicAPIDocument } from './types'
// import { usePrismicPreviewContext } from './usePrismicPreviewContext'
// export type UsePrismicPreviewBootstrapFn = () => void

// export interface UsePrismicPreviewBootstrapState {
//   state: 'INIT' | 'BOOTSTRAPPING' | 'BOOTSTRAPPED' | 'FAILED'
//   error?: Error
// }

// enum UsePrismicPreviewBootstrapActionType {
//   BeginBootstrapping = 'BeginBootstrapping',
//   Bootstrapped = 'Resolved',
//   Fail = 'Fail',
// }

// type UsePrismicPreviewBootstrapAction =
//   | {
//       type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping
//     }
//   | {
//       type: UsePrismicPreviewBootstrapActionType.Bootstrapped
//     }
//   | {
//       type: UsePrismicPreviewBootstrapActionType.Fail
//       payload: Error
//     }

// const initialLocalState: UsePrismicPreviewBootstrapState = {
//   state: 'INIT',
// }

// const localReducer = (
//   state: UsePrismicPreviewBootstrapState,
//   action: UsePrismicPreviewBootstrapAction,
// ): UsePrismicPreviewBootstrapState => {
//   switch (action.type) {
//     case UsePrismicPreviewBootstrapActionType.BeginBootstrapping: {
//       return {
//         ...initialLocalState,
//         state: 'BOOTSTRAPPING',
//       }
//     }

//     case UsePrismicPreviewBootstrapActionType.Bootstrapped: {
//       return {
//         ...state,
//         state: 'BOOTSTRAPPED',
//       }
//     }

//     case UsePrismicPreviewBootstrapActionType.Fail: {
//       return {
//         ...initialLocalState,
//         state: 'FAILED',
//         error: action.payload,
//       }
//     }
//   }
// }

// interface UsePrismicPreviewBootstrapProgramEnv extends CreateClientEnv {
//   beginResolving(): void
//   resolved(path: string): void
//   linkResolver(doc: PrismicAPIDocument): string
//   shouldAutoRedirect: boolean
// }

// const usePrismicPreviewBootstrapProgram: RTE.ReaderTaskEither<
//   UsePrismicPreviewBootstrapProgramEnv,
//   Error,
//   void
// > = pipe()

// export type UsePrismicPreviewBootstrapConfig = {}

// export const usePrismicPreviewBootstrap = (
//   repositoryName: string,
//   config: UsePrismicPreviewBootstrapConfig,
// ): readonly [UsePrismicPreviewBootstrapState, UsePrismicPreviewBootstrapFn] => {
//   const [state] = usePrismicPreviewContext(repositoryName)
//   const [localState, localDispatch] = React.useReducer(
//     localReducer,
//     initialLocalState,
//   )

//   const resolvePreview = React.useCallback(async (): Promise<void> => {
//     pipe(
//       await RTE.run(usePrismicPreviewBootstrapProgram, {
//         beginResolving: () =>
//           localDispatch({
//             type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping,
//           }),
//         resolved: (path) =>
//           localDispatch({
//             type: UsePrismicPreviewBootstrapActionType.Bootstrapped,
//             payload: path,
//           }),
//         linkResolver: config.linkResolver,
//         apiEndpoint: state.pluginOptions.apiEndpoint,
//         accessToken: state.pluginOptions.accessToken,
//         shouldAutoRedirect: config.shouldAutoRedirect ?? false,
//       }),
//       E.fold(
//         (error) =>
//           localDispatch({
//             type: UsePrismicPreviewBootstrapActionType.Fail,
//             payload: error,
//           }),
//         constVoid,
//       ),
//     )
//   }, [])

//   return React.useMemo(() => [localState, resolvePreview] as const, [
//     localState,
//     resolvePreview,
//   ])
// }
