import { createNodeHelpers } from 'gatsby-node-helpers'

import { PrismicAPIDocumentNodeInput, UnknownRecord } from '../../src'
import { createPrismicAPIDocument } from './createPrismicAPIDocument'

const createNodeId = (id: string): string => id
const createContentDigest = (_: unknown): string => 'createContentDigest'

export const createPrismicAPIDocumentNodeInput = <
  TData extends UnknownRecord<string>
>(
  data: TData = {} as TData,
  { typePrefix = 'Prismic' } = {},
): PrismicAPIDocumentNodeInput<TData> => {
  const nodeHelpers = createNodeHelpers({
    typePrefix,
    createNodeId,
    createContentDigest,
  })
  const doc = createPrismicAPIDocument(data)

  return nodeHelpers.createNodeFactory(doc.type)(
    doc,
  ) as PrismicAPIDocumentNodeInput<TData>
}
