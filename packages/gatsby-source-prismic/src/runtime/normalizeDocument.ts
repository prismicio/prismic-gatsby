import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'

import {
  PrismicDocumentNodeInput,
  PrismicSpecialType,
  TypePath,
} from '../types'

import { RuntimeConfig } from './store'

import { link } from './normalizers/link'

type NormalizeDocumentConfig<TDocument extends prismicT.PrismicDocument> = {
  document: TDocument
  runtimeConfig: RuntimeConfig
}

export const normalizeDocument = <TDocument extends prismicT.PrismicDocument>(
  config: NormalizeDocumentConfig<TDocument>,
): PrismicDocumentNodeInput<TDocument> => {}

type NormalizeDocumentSubtreeConfig = {
  path: string[]
  subtree: unknown
  linkResolver: prismicH.LinkResolverFunction
  getNode(id: string): PrismicDocumentNodeInput | undefined
  getTypePath(path: string[]): TypePath | undefined
}

function assertDocument(
  value: unknown,
): asserts value is prismicT.PrismicDocument {
  if (!(typeof value === 'object' && value !== null)) {
    throw new Error('The provided value is not a document')
  }
}

function assertLink(value: unknown): asserts value is prismicT.LinkField {
  if (!(typeof value === 'object' && value !== null && 'link_type' in value)) {
    throw new Error('The provided value is not a link')
  }
}

const normalizeDocumentSubtree = (
  config: NormalizeDocumentSubtreeConfig,
): unknown => {
  const type = config.getTypePath(config.path)
  if (!type) {
    throw new Error(`No type for path: ${config.path.join('.')}`)
  }

  switch (type.type) {
    case PrismicSpecialType.Document: {
      assertDocument(config.subtree)

      const result: unknown = {}

      return result
    }

    case prismicT.CustomTypeModelFieldType.Link: {
      assertLink(config.subtree)

      return link({
        value: config.subtree,
        getNode: config.getNode,
        linkResolver: config.linkResolver,
      })
    }
  }
}
