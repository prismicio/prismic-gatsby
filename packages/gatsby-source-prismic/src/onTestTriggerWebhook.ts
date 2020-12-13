import * as RTE from 'fp-ts/ReaderTaskEither'
import { Dependencies, reportInfo } from 'gatsby-prismic-core'

export const onTestTriggerWebhook: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = reportInfo(`Success! Received a test trigger webhook.`)
