import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { setPrismicWindowEndpoint } from './lib/setPrismicWindowEndpoint'
import { setPluginOptionsOnWindow } from './lib/setPluginOptionsOnWindow'

import { PluginOptions } from './types'

interface OnClientEntryProgramEnv {
  pluginOptions: PluginOptions
}

export const setupLegacyToolbar: RTE.ReaderTaskEither<
  OnClientEntryProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<OnClientEntryProgramEnv>(),
  RTE.chainW(
    RTE.fromPredicate(
      (env) => env.pluginOptions.toolbar === 'legacy',
      () =>
        new Error(
          'Only repositories using the legacy toolbar must call this API.',
        ),
    ),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(setPrismicWindowEndpoint(env.pluginOptions.apiEndpoint)),
  ),
  RTE.map(constVoid),
  // We don't care if this fails.
  RTE.orElse(() => RTE.of(void 0 as void)),
)

export const setWindowPluginOptions: RTE.ReaderTaskEither<
  OnClientEntryProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<OnClientEntryProgramEnv>(),
  RTE.chainW(
    RTE.fromPredicate(
      () => typeof window !== 'undefined',
      () => new Error('Window plugin options do not need to be set in SSR'),
    ),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(setPluginOptionsOnWindow(env.pluginOptions)),
  ),
  RTE.map(constVoid),
  // We don't care if this fails.
  RTE.orElse(() => RTE.of(void 0 as void)),
)

export const onClientEntryProgram: RTE.ReaderTaskEither<
  OnClientEntryProgramEnv,
  Error,
  void
> = pipe(
  [setupLegacyToolbar, setWindowPluginOptions],
  A.sequence(RTE.readerTaskEither),
  RTE.map(constVoid),
)

export const onClientEntry: NonNullable<
  gatsby.GatsbyBrowser['onClientEntry']
> = async (
  _gatsbyContext: gatsby.BrowserPluginArgs,
  pluginOptions: PluginOptions,
) =>
  // We don't care about the output of the program so we won't be doing
  // anything with the result.
  await RTE.run(onClientEntryProgram, { pluginOptions })
