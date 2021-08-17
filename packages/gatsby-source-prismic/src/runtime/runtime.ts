import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'
import * as imgixGatsby from '@imgix/gatsby'
import * as nodeHelpers from 'gatsby-node-helpers'
import md5 from 'tiny-hashes/md5'

import { TransformFieldNameFn, TypePath } from '../types'
import { normalize } from './normalize'
import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  GLOBAL_TYPE_PREFIX,
} from '../constants'
import { NormalizedPrismicDocumentNodeInput } from './types'
import { SetRequired } from 'type-fest'
import {
  customTypeModelToTypePaths,
  sharedSliceModelToTypePaths,
} from './typePaths'

const createNodeId = (input: string): string => md5(input)
const createContentDigest = <T>(input: T): string => md5(JSON.stringify(input))

export type RuntimeConfig = {
  typePrefix?: string
  linkResolver?: prismicH.LinkResolverFunction
  imageImgixParams?: imgixGatsby.ImgixUrlParams
  imagePlaceholderImgixParams?: imgixGatsby.ImgixUrlParams
  htmlSerializer?: prismicH.HTMLMapSerializer | prismicH.HTMLFunctionSerializer
  transformFieldName?: TransformFieldNameFn
}

type SubscriberFn = () => void

export const createRuntime = (config: RuntimeConfig = {}): Runtime => {
  return new Runtime(config)
}

export class Runtime {
  nodes: NormalizedPrismicDocumentNodeInput[] = []
  typePaths: TypePath[] = []
  subscribers: SubscriberFn[] = []

  config: SetRequired<
    RuntimeConfig,
    'imageImgixParams' | 'imagePlaceholderImgixParams' | 'transformFieldName'
  >

  nodeHelpers: nodeHelpers.NodeHelpers

  constructor(config: RuntimeConfig = {}) {
    this.nodes = []
    this.typePaths = []
    this.subscribers = []

    this.config = {
      imageImgixParams: DEFAULT_IMGIX_PARAMS,
      imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
      transformFieldName: (fieldName: string) => fieldName.replace(/-/g, '_'),
      ...config,
    }

    this.nodeHelpers = nodeHelpers.createNodeHelpers({
      typePrefix: [GLOBAL_TYPE_PREFIX, config.typePrefix]
        .filter(Boolean)
        .join(' '),
      fieldPrefix: GLOBAL_TYPE_PREFIX,
      createNodeId,
      createContentDigest,
    })
  }

  subscribe(callback: SubscriberFn): void {
    this.subscribers = [...this.subscribers, callback]
  }

  registerCustomTypeModels(models: prismicT.CustomTypeModel[]): void {
    const typePaths = models.flatMap((model) =>
      customTypeModelToTypePaths(model),
    )

    this.typePaths = [...this.typePaths, ...typePaths]

    this.#notifySubscribers()
  }

  registerSharedSliceModels(models: prismicT.SharedSliceModel[]): void {
    const typePaths = models.flatMap((model) =>
      sharedSliceModelToTypePaths(model),
    )

    this.typePaths = [...this.typePaths, ...typePaths]

    this.#notifySubscribers()
  }

  registerTypePaths(typePaths: TypePath[]): void {
    this.typePaths = [...this.typePaths, ...typePaths]

    this.#notifySubscribers()
  }

  registerDocument<PrismicDocument extends prismicT.PrismicDocument>(
    document: PrismicDocument,
  ): NormalizedPrismicDocumentNodeInput<PrismicDocument> {
    const normalizedDocument = this.#normalizeDocument(document)

    this.nodes = [...this.nodes, normalizedDocument]

    this.#notifySubscribers()

    return normalizedDocument
  }

  registerDocuments(documents: prismicT.PrismicDocument[]): void {
    const nodes = documents.map((document) => {
      return this.#normalizeDocument(document)
    })

    this.nodes = [...this.nodes, ...nodes]

    this.#notifySubscribers()
  }

  #normalizeDocument<PrismicDocument extends prismicT.PrismicDocument>(
    document: PrismicDocument,
  ): NormalizedPrismicDocumentNodeInput<PrismicDocument> {
    const normalizedDocument = normalize({
      value: document,
      path: [document.type],
      getNode: this.#getNode.bind(this),
      getTypePath: this.#getTypePath.bind(this),
      nodeHelpers: this.nodeHelpers,
      linkResolver: this.config.linkResolver,
      htmlSerializer: this.config.htmlSerializer,
      imageImgixParams: this.config.imageImgixParams,
      imagePlaceholderImgixParams: this.config.imagePlaceholderImgixParams,
      transformFieldName: this.config.transformFieldName,
    })

    return this.nodeHelpers.createNodeFactory(document.type)(
      normalizedDocument,
    ) as NormalizedPrismicDocumentNodeInput<PrismicDocument>
  }

  #getNode(id: string): NormalizedPrismicDocumentNodeInput | undefined {
    return this.nodes.find((node) => node.prismicId === id)
  }

  #getTypePath(path: string[]): TypePath | undefined {
    return this.typePaths.find(
      (typePath) =>
        typePath.path.join('__SEPARATOR__') === path.join('__SEPARATOR__'),
    )
  }

  #notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber()
    }
  }
}
