import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

import { aggregateQuery } from './aggregateQuery'

/**
 * Queries a list of documents by their IDs from a Prismic repository using the
 * environment's configuration. The following fields from the environment's
 * `pluginOptions` are used, in addition to those used in `createClient`:
 *
 * - `pluginOptions.releaseID`: Prismic Release ID from which to fetch
 *   documents. If not provided, the master ref is used.
 *
 * - `pluginOptions.fetchLinks`: List of document link fields to fetch.
 *
 * - `pluginOptions.lang`: Language of documents to fetch. If not provided, all
 *   languages are fetched.
 *
 * @returns List of Prismic documents.
 */
export const queryDocumentsByIds = (
  ids: string[],
): RTE.ReaderTaskEither<Dependencies, Error, prismic.Document[]> =>
  aggregateQuery(prismic.predicate.in('document.id', ids))
