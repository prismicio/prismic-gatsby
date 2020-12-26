import * as cookie from 'es-cookie'

/**
 * Get the value of a cookie with a given key. If the value does not exist, or
 * the environment does not support document cookies (e.g. Node.JS), `undefined`
 * is returned.
 *
 * @param key Key used to fetch the cookie value.
 *
 * @returns Value of the cookie if it exists, `undefined` otherwise.
 */
export const getCookieSafely = (key: string): string | undefined => {
  try {
    return cookie.get(key)
  } catch {
    return undefined
  }
}
