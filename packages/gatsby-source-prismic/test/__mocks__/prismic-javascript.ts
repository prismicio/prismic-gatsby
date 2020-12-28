import { nodes } from '../__fixtures__/gatsbyContext'
import mockDocument from '../__fixtures__/document.json'

let deletedDocumentIds = [] as (string | undefined)[]

// Call this function in individual tests to ensure certain documents are not
// returned by the mocked API.
export const setDeletedDocumentIds = (ids: (string | undefined)[]): void =>
  void (deletedDocumentIds = ids)

// Reset the deleted documents state.
export const resetDeletedDocumentIds = (): void =>
  void (deletedDocumentIds = [])

export default {
  getApi: (): unknown =>
    Promise.resolve({
      query: () =>
        Promise.resolve({
          total_pages: 1,
          results: nodes
            .filter((node) => !deletedDocumentIds.includes(node.prismicId))
            .map((node) => ({ ...mockDocument, id: node.prismicId })),
        }),
      getByIDs: (ids: string[]) =>
        Promise.resolve({
          total_pages: 1,
          results: ids
            .filter((id) => !deletedDocumentIds.includes(id))
            .map((id) => ({
              ...mockDocument,
              id,
            })),
        }),
      refs: [],
      masterRef: { ref: 'master' },
    }),
}
