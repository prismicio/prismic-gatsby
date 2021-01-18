// import * as RTE from 'fp-ts/ReaderTaskEither'
// import * as TE from 'fp-ts/TaskEither'
// import * as E from 'fp-ts/Either'
// import * as R from 'fp-ts/Record'
// import { pipe } from 'fp-ts/function'
// import { Client, createClient, CreateClientEnv } from './createClient'

// export type IsAccessTokenRequiredProbeEnv = CreateClientEnv

// export const isAccessTokenRequiredProbe: RTE.ReaderTaskEither<IsAccessTokenRequiredProbeEnv, never, boolean> = pipe(
//   RTE.ask<IsAccessTokenRequiredProbeEnv>(),
//   RTE.chainFirst(env => RTE.of(env.accessToken = null)),
//   RTE.bind('client', () => createClient),
//   RTE.chain(env => RTE.fromTaskEither(TE.tryCatchK(env.client.getApi)))
//   // E.tryCatch(() => client.getPreviewResolver(token), onError)
// )
