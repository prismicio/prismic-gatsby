import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { REPORTER_TEMPLATE } from '../constants'

import { sprintf } from './sprintf'

interface ReportErrorEnv {
  repositoryName: string
  reportError(text: string): void
}

export const reportError = (
  text: string,
): RTE.ReaderTaskEither<ReportErrorEnv, never, void> =>
  RTE.asks((env) =>
    pipe(sprintf(REPORTER_TEMPLATE, env.repositoryName, text), env.reportError),
  )
