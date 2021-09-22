import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { WEBHOOK_TEST_TRIGGER_SUCCESS_MSG } from './constants'
import { reportInfo } from './lib/reportInfo'
import { Dependencies } from './types'
import { touchAllNodes } from './lib/touchAllNodes'

/**
 * To be executed in the `sourceNodes` API when a Prismic `test-trigger` webhook
 * is received.
 *
 * This handler simply prints a success string to the console to signify receipt.
 */
export const onWebhookTestTrigger: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  reportInfo(WEBHOOK_TEST_TRIGGER_SUCCESS_MSG),
  RTE.chainFirstW(() => touchAllNodes()),
)
