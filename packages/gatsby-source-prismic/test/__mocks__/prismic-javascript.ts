import mockDocument from '../__fixtures__/document.json'

export default {
  getApi: () =>
    Promise.resolve({
      query: () =>
        Promise.resolve({
          page: 1,
          results_per_page: 20,
          results_size: 1,
          total_results_size: 1,
          total_pages: 1,
          next_page: null,
          prev_page: null,
          results: [mockDocument],
          version: '83cd855',
          license: 'All Rights Reserved',
        }),
      refs: [],
      masterRef: { ref: 'master' },
    }),
}
