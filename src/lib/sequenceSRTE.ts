import * as Ap from 'fp-ts/Apply'
import * as RTE from 'fp-ts/ReaderTaskEither'

export const sequenceSRTE = Ap.sequenceS(RTE.readerTaskEither)
