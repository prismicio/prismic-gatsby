import { SourceNodesArgs } from 'gatsby'
import { WebhookBase, PluginOptions, PrismicWebhook, TypePath, WebhookDocument } from 'types';
import { fetchDocumentsByIds } from './api'
import { documentsToNodes } from './documentsToNodes'
import { createEnvironment } from './environment.node'
import { msg } from './utils'

type maybeWebhook = WebhookBase | any;

export function validateSecret(pluginOptions: PluginOptions, webhookBody: maybeWebhook): boolean {
  // if(!pluginOptions.webhookSecret && !webhookBody) return false;
  if(!pluginOptions.webhookSecret) return true;
  if(pluginOptions.webhookSecret && !webhookBody) return false;
  return pluginOptions.webhookSecret === webhookBody.secret;
}

export function isPrismicUrl(url: string | undefined): boolean {
  if(!url) return false; 
  const regexp = /^https?:\/\/([^.]+)\.(wroom\.(?:test|io)|prismic\.io)\/api\/?/;
  return regexp.test(url);
}


export function isPrismicWebhook(webhookBody: maybeWebhook): boolean {

  if(!webhookBody) return false;

  if(typeof webhookBody !== "object") return false;

  if(webhookBody.type === "test-trigger") return false;

  return isPrismicUrl(webhookBody.apiUrl)
}


export async function handleWebhook(pluginOptions: PluginOptions, gatsbyContext: SourceNodesArgs, typePaths: TypePath[], webhook: PrismicWebhook) {
  const { releaseID } = pluginOptions
  const { reporter } = gatsbyContext
  
  reporter.info(msg("Processing webhook"))

  // eventually we could handle changes to mask and custom types here :)

  const mainApiAdditions = (webhook.documents.addition || [])

  const releaseAdditions = [
    ...webhook.releases.update || [],
    ...webhook.releases.addition || []
  ].reduce((acc, release) => {
    if(release.id !== releaseID) return acc;

    return [
      ...acc,
      ...(release.documents.addition || []),
      // ...release.document.update || [], // not part of document spec at the moment
    ]

  }, [] as WebhookDocument[])


  /* const releaseRemovals = (prismicWebhook.releases.deletion || []).map(doc => doc.id)
  const mainApiRemovals = (prismicWebhook.documents.deletion || []).map(doc => doc.id) */

  const buildRelease = (releaseID && process.env.GATSBY_ENV === 'development')
 
  const documentsToAdd = buildRelease ? [...releaseAdditions, ...mainApiAdditions] : mainApiAdditions

  if(documentsToAdd.length) {
    await handleWebhookUpdates(pluginOptions, gatsbyContext, typePaths, documentsToAdd);
  }
  
  reporter.info(msg("Processed webhook"))
}

export async function handleWebhookUpdates(pluginOptions: PluginOptions, gatsbyContext: SourceNodesArgs, typePaths: TypePath[], documents: WebhookDocument[]) {

  const { reporter } = gatsbyContext

  reporter.info(msg(`Updating ${documents.length} documents`))
  
  const newDocs = await fetchDocumentsByIds(pluginOptions, gatsbyContext, documents)
  
  const env = createEnvironment(pluginOptions, gatsbyContext, typePaths)

  const processedDocuments = await documentsToNodes(newDocs, env)

  reporter.info(msg(`Updated ${processedDocuments.length} documents`))
}

export async function handleWebhookDeletions(...args: any) {
  return args;
}