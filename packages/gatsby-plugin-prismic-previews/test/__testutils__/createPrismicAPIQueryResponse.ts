import * as prismic from 'ts-prismic'
import { createPrismicAPIDocument } from './createPrismicAPIDocument'

export const createPrismicAPIQueryResponse = (
  docs = [createPrismicAPIDocument(), createPrismicAPIDocument()],
  overrides?: Partial<prismic.Response.Query>,
): prismic.Response.Query => ({
  page: 1,
  results_per_page: docs.length,
  results_size: docs.length,
  total_results_size: docs.length,
  total_pages: 1,
  next_page: '',
  prev_page: '',
  results: docs,
  ...overrides,
})
