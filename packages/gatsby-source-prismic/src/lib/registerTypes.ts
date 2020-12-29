import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { registerType } from './registerType'

/**
 * Registers one or more types.
 *
 * @see gatsby-source-prismic/lib/registerType.ts
 */
export const registerTypes = flow(
  A.map(registerType),
  A.sequence(RTE.readerTaskEither),
)
