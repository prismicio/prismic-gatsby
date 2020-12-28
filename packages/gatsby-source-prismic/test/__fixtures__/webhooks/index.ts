import {
  PrismicWebhookBodyApiUpdate,
  PrismicWebhookBodyTestTrigger,
} from '../../../src/types'

import docAdditionJson from './api-update-doc-addition.json'
import docDeletionJson from './api-update-doc-deletion.json'
import releaseDocAdditionJson from './api-update-release-doc-addition.json'
import releaseDocDeletionJson from './api-update-release-doc-deletion.json'
import testTriggerJson from './test-trigger.json'
import unknownJson from './unknown.json'

export const testTrigger = testTriggerJson as PrismicWebhookBodyTestTrigger
export const apiUpdateDocAddition = docAdditionJson as PrismicWebhookBodyApiUpdate
export const apiUpdateDocDeletion = docDeletionJson as PrismicWebhookBodyApiUpdate
export const apiUpdateReleaseDocAddition = releaseDocAdditionJson as PrismicWebhookBodyApiUpdate
export const apiUpdateReleaseDocDeletion = releaseDocDeletionJson as PrismicWebhookBodyApiUpdate
export const unknown = unknownJson
