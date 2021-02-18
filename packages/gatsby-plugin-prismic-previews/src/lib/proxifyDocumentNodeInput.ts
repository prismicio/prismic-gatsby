import * as RE from 'fp-ts/ReaderEither'

import { PrismicAPIDocumentNodeInput } from '../types'

import {
  proxyDocumentSubtree,
  ProxifyDocumentSubtreeEnv,
} from './proxifyDocumentSubtree'

export type ProxifyDocumentNodeInputEnv = ProxifyDocumentSubtreeEnv

export const proxifyDocumentNodeInput = <T extends PrismicAPIDocumentNodeInput>(
  nodeInput: T,
): RE.ReaderEither<ProxifyDocumentNodeInputEnv, Error, unknown> =>
  proxyDocumentSubtree([nodeInput.type], nodeInput)
