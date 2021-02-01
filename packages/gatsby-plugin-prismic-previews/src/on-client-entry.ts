import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, constVoid } from 'fp-ts/function'

import { setPrismicWindowEndpoint } from './lib/setPrismicWindowEndpoint'

import { PluginOptions } from './types'

interface OnClientEntryProgramEnv {
  apiEndpoint: string
  toolbar: PluginOptions['toolbar']
}

export const onClientEntryProgram: RTE.ReaderTaskEither<
  OnClientEntryProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<OnClientEntryProgramEnv>(),
  RTE.chainW(
    RTE.fromPredicate(
      (env) => env.toolbar === 'legacy',
      () =>
        new Error(
          'Only repositories using the legacy toolbar must call this API.',
        ),
    ),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(setPrismicWindowEndpoint(env.apiEndpoint)),
  ),
  RTE.map(constVoid),
)

export const onClientEntry: NonNullable<
  gatsby.GatsbyBrowser['onClientEntry']
> = async (
  _gatsbyContext: gatsby.BrowserPluginArgs,
  pluginOptions: PluginOptions,
) =>
  // We don't care about the output of the program.
  await RTE.run(onClientEntryProgram, {
    apiEndpoint: pluginOptions.apiEndpoint,
    toolbar: pluginOptions.toolbar,
  })
