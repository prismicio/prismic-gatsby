import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { REPORTER_TEMPLATE } from '../constants'

import { sprintf } from './sprintf'

export interface ReportInfoEnv {
  repositoryName: string
  reportInfo(text: string): void
}

export const reportInfo = (
  text: string,
): RTE.ReaderTaskEither<ReportInfoEnv, never, void> =>
  RTE.asks((env) =>
    pipe(sprintf(REPORTER_TEMPLATE, env.repositoryName, text), env.reportInfo),
  )
