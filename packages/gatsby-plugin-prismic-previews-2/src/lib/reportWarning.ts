import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { REPORTER_TEMPLATE } from '../constants'

import { sprintf } from './sprintf'

interface ReportWarningEnv {
  repositoryName: string
  reportWarning(text: string): void
}

export const reportWarning = (
  text: string,
): RTE.ReaderTaskEither<ReportWarningEnv, never, void> =>
  RTE.asks((env) =>
    pipe(
      sprintf(REPORTER_TEMPLATE, env.repositoryName, text),
      env.reportWarning,
    ),
  )
