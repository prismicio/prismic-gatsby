import * as RE from 'fp-ts/ReaderEither'

import { PrismicAPIDocumentNodeInput } from '../types'

import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from './proxyDocumentSubtree'

export type ProxyDocumentNodeInputEnv = ProxyDocumentSubtreeEnv

export const proxyDocumentNodeInput = <T extends PrismicAPIDocumentNodeInput>(
  nodeInput: T,
): RE.ReaderEither<ProxyDocumentNodeInputEnv, Error, unknown> =>
  proxyDocumentSubtree([nodeInput.type], nodeInput)
