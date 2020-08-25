import { PrismicWebhook, TestWebhook} from '../../../src/types';

import mainApiAdditionJson from './main-api-doc-addition.json';
import mainApiDeletionJson from './main-api-doc-deletion.json';
import releaseAdditionJson from './release-addition.json';
import releaseDeletionJson from './release-delete-doc.json';
import testTriggerJson from './test-trigger.json';

const testTrigger = testTriggerJson as TestWebhook;
const mainApiAddition = mainApiAdditionJson as PrismicWebhook;
const mainApiDeletion = mainApiDeletionJson as PrismicWebhook;
const releaseAddition = releaseAdditionJson as PrismicWebhook;
const releaseDeletion = releaseDeletionJson as PrismicWebhook;

export {
  mainApiAddition,
  mainApiDeletion,
  releaseAddition,
  releaseDeletion,
  testTrigger,
}