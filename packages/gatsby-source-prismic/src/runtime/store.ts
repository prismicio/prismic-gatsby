import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'
import * as imgixGatsby from '@imgix/gatsby'

import {
  PrismicDocumentNodeInput,
  TransformFieldNameFn,
  TypePath,
} from '../types'
import { normalizeDocument } from './normalizeDocument'

export type RuntimeConfig = {
  typePrefix?: string
  linkResolver?: prismicH.LinkResolverFunction
  imageImgixParams?: imgixGatsby.ImgixUrlParams
  imagePlaceholderImgixParams?: imgixGatsby.ImgixUrlParams
  htmlSerializer?: prismicH.HTMLMapSerializer | prismicH.HTMLFunctionSerializer
  transformFieldName?: TransformFieldNameFn
}

type SubscriberFn = () => void

export class Runtime {
  config: RuntimeConfig

  nodes: PrismicDocumentNodeInput[] = []

  typePaths: TypePath[] = []

  subscribers: SubscriberFn[] = []

  constructor(config: RuntimeConfig) {
    this.config = config
  }

  subscribe(callback: SubscriberFn): void {
    this.subscribers = [...this.subscribers, callback]
  }

  registerTypePaths(typePaths: TypePath[]): void {
    this.typePaths = [...this.typePaths, ...typePaths]

    this.#notifySubscribers()
  }

  registerDocuments(documents: prismicT.PrismicDocument[]): void {
    const nodes = documents.map((document) =>
      normalizeDocument({
        document,
        runtimeConfig: this.config,
      }),
    )

    this.nodes = [...this.nodes, ...nodes]

    this.#notifySubscribers()
  }

  #notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber()
    }
  }
}
