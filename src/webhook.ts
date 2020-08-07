// import { isPrismicUrl } from './utils'

type maybeString = string | null | undefined;

export function validateSecret(configSecret: maybeString, webhookSecret: maybeString): boolean {
  if(!configSecret && !webhookSecret) return true;
  return configSecret === webhookSecret;
}
