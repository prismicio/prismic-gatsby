export type PrismicWebhookBody =
  | PrismicWebhookBodyApiRelease
  | PrismicWebhookBodyTestTrigger

enum PrismicWebhookType {
  APIUpdate = 'api-update',
  TestTrigger = 'test-trigger',
}

interface PrismicWebhookBodyBase {
  type: PrismicWebhookType
  domain: string
  apiUrl: string
  secret: string | null
}

export interface PrismicWebhookBodyApiRelease extends PrismicWebhookBodyBase {
  type: PrismicWebhookType.APIUpdate
  masterRef?: string
  releases: PrismicWebhookOperations<PrismicWebhookRelease>
  masks: PrismicWebhookOperations<PrismicWebhookMask>
  tags: PrismicWebhookOperations<PrismicWebhookTag>
  documents: string[]
  experiments?: PrismicWebhookOperations<PrismicWebhookExperiment>
}

export interface PrismicWebhookBodyTestTrigger extends PrismicWebhookBodyBase {
  type: PrismicWebhookType.TestTrigger
}

interface PrismicWebhookMask {
  id: string
  label: string
}

interface PrismicWebhookTag {
  id: string
}

interface PrismicWebhookRelease {
  id: string
  ref: string
  label: string
  documents: string[]
}

interface PrismicWebhookOperations<T> {
  update?: T[]
  addition?: T[]
  deletion?: T[]
}

/**
 * @deprecated
 */
interface PrismicWebhookExperiment {
  id: string
  name: string
  variations: PrismicWebhookExperimentVariation[]
}

/**
 * @deprecated
 */
interface PrismicWebhookExperimentVariation {
  id: string
  ref: string
  label: string
}
