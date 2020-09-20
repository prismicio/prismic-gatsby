import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow, constVoid } from 'fp-ts/function'

import { createNode } from './createNode'

export const createNodes = flow(
  A.map(createNode),
  A.sequence(RTE.readerTaskEither),
  RTE.map(constVoid),
)
