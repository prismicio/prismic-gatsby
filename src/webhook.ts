import { SourceNodesArgs } from 'gatsby'
import { WebhookBase, PluginOptions, PrismicWebhook, TypePath } from 'types';
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents'

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

  const mainApiDocuments = webhook.documents || []

  const releaseDocuments = [
    ...webhook.releases.update || [],
    ...webhook.releases.addition || [],
    ...webhook.releases.deletion || [],
  ].reduce((acc, release) => {
    if(release.id !== releaseID) return acc;

    return [
      ...acc,
      ...release.documents || [],
    ]

  }, [] as string[])

  const documentsToCheck: string[] = (releaseID) ? [
    ...releaseDocuments,
    ...mainApiDocuments
  ] : mainApiDocuments


  reporter.info(msg(`checking ${documentsToCheck.length} ${documentsToCheck.length > 1 ? "documents" : "document"}`))

  const documentsToUpdate: PrismicDocument[] = documentsToCheck.length ? await fetchDocumentsByIds(pluginOptions, gatsbyContext, documentsToCheck) : []

  const documentsToUpdateIds = documentsToUpdate.map(doc => doc.id)

  const documentsToRemove = documentsToCheck.filter(id => documentsToUpdateIds.includes(id) === false)

  if(documentsToRemove.length) {
    await handleWebhookDeletions(gatsbyContext, documentsToRemove)
  }

  if(documentsToUpdate.length) {
    await handleWebhookUpdates(pluginOptions, gatsbyContext, typePaths, documentsToUpdate);
  }
  
  reporter.info(msg("Processed webhook"))
}

export async function handleWebhookUpdates(pluginOptions: PluginOptions, gatsbyContext: SourceNodesArgs, typePaths: TypePath[], documents: PrismicDocument[]) {

  const { reporter } = gatsbyContext

  reporter.info(msg(`Updating ${documents.length} ${documents.length > 1 ? "documents" : "document"}`))
    
  const env = createEnvironment(pluginOptions, gatsbyContext, typePaths)

  const processedDocuments = await documentsToNodes(documents, env)

  reporter.info(msg(`Updated ${processedDocuments.length} ${processedDocuments.length > 1 ? "documents" : "document"} `))
}

export async function handleWebhookDeletions(gatsbyContext: SourceNodesArgs, documents: string[]) {

  const { reporter, actions, getNode, createNodeId } = gatsbyContext
  const { deleteNode } = actions
  
  reporter.info(msg(`removing ${documents.length} ${documents.length > 1 ? "documents" : "document"}`))
    
  const count = documents.map(id => createNodeId(id))
  .map(getNode)
  .reduce((acc: number, node) => {
    deleteNode({ node })
    return acc + 1;
  }, 0)

  reporter.info(msg(`removed ${count} ${count > 1 ? "documents" : "document"}`))
}
