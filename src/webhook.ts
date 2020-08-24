import { WebhookBase, PluginOptions } from 'types';

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