import * as RTE from 'fp-ts/ReaderTaskEither'
import { Dependencies, reportInfo } from 'gatsby-prismic-core'

import { WEBHOOK_TEST_TRIGGER_SUCCESS_MSG } from './constants'

export const onTestTriggerWebhook: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = reportInfo(WEBHOOK_TEST_TRIGGER_SUCCESS_MSG)
