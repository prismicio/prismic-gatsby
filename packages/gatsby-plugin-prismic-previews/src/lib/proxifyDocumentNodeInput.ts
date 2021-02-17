import { PrismicAPIDocumentNodeInput } from '../types'

import {
  proxifyDocumentSubtree,
  ProxifyDocumentSubtreeEnv,
} from './proxifyDocumentSubtree'

export type ProxifyDocumentNodeInputEnv = ProxifyDocumentSubtreeEnv

// TODO: Refactor to use ReaderTaskEither
export const proxifyDocumentNodeInput = <T extends PrismicAPIDocumentNodeInput>(
  nodeInput: T,
) => (env: ProxifyDocumentSubtreeEnv): T =>
  proxifyDocumentSubtree([nodeInput.type], nodeInput)(env)
