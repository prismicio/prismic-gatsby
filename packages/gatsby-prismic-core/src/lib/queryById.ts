import * as T from 'fp-ts/Task'

import { PrismicClient, PrismicClientQueryOptions, ResolveType } from '../types'

export const queryById = (
  client: PrismicClient,
  id: string,
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['getByID']>>> => (): ReturnType<
  typeof client.getByID
> => client.getByID(id, queryOptions)
