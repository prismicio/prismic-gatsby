import * as prismic from '@prismicio/client'
import * as prismicT from '@prismicio/types'

import { createPrismicAPIDocument } from './createPrismicAPIDocument'

export const createPrismicAPIQueryResponse = <
  TDocument extends prismicT.PrismicDocument,
>(
  docs = [
    createPrismicAPIDocument<TDocument['data']>(),
    createPrismicAPIDocument<TDocument['data']>(),
  ],
  overrides?: Partial<prismic.Query<TDocument>>,
): prismic.Query<TDocument> => ({
  page: 1,
  results_per_page: docs.length,
  results_size: docs.length,
  total_results_size: docs.length,
  total_pages: 1,
  next_page: '',
  prev_page: '',
  results: docs as TDocument[],
  ...overrides,
})
