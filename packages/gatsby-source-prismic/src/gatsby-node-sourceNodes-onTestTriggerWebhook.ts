import * as RTE from 'fp-ts/ReaderTaskEither'

import { WEBHOOK_TEST_TRIGGER_SUCCESS_MSG } from './constants'
import { reportInfo } from './lib/reportInfo'
import { Dependencies } from './types'

export const onTestTriggerWebhook: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = reportInfo(WEBHOOK_TEST_TRIGGER_SUCCESS_MSG)
