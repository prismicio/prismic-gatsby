import { name as pkgName } from '../package.json'

/**
 * Returns a namespaced string intended for logging.
 *
 * @param message Message to namespace.
 *
 * @returns Namespaced message.
 */
export const msg = (message: string) => `${pkgName} - ${message}`
