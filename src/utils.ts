import * as React from 'react'
import { pascalCase, pascalCaseTransformMerge } from 'pascal-case'

/**
 * Returns a namespaced string intended for logging.
 *
 * @param message Message to namespace.
 *
 * @returns Namespaced message.
 */
export const msg = (message: string) => `gatsby-source-prismic - ${message}`

/**
 * Maps key-value tuples of an object to new key-value tuples to create a new
 * object.
 *
 * @param fn Function that maps a key-value tuple to a new key-value tuple.
 * @param obj Object to map to a new object.
 *
 * @returns New object with mapped key-values.
 */
export const mapObj = <T1, T2>(
  fn: (entry: [string, T1]) => [string, T2],
  obj: { [key: string]: T1 },
): { [key: string]: T2 } => {
  const entries = Object.entries(obj)
  const pairs = entries.map((x) => fn(x))

  const result: { [key: string]: T2 } = {}

  for (let i = 0; i < pairs.length; i++) {
    const [k, v] = pairs[i]
    result[k] = v
  }

  return result
}

/**
 * Maps key-value tuples of an object to new key-value tuples to create a new
 * object. The mapper function can be async.
 *
 * @param fn Function that maps a key-value tuple to a new key-value tuple.
 * @param obj Object to map to a new object.
 *
 * @returns New object with mapped key-values.
 */
export const mapObjP = async <T1, T2>(
  fn: (entry: [string, T1]) => Promise<[string, T2]>,
  obj: { [key: string]: T1 },
): Promise<{ [key: string]: T2 }> => {
  const entries = Object.entries(obj)
  const pairs = await Promise.all(entries.map((x) => Promise.resolve(fn(x))))

  const result: { [key: string]: T2 } = {}

  for (let i = 0; i < pairs.length; i++) {
    const [k, v] = pairs[i]
    result[k] = v
  }

  return result
}

/**
 * Maps values of an object to new values.
 *
 * @param fn Function that maps a value and key to a new value.
 * @param obj Object to map to a new object.
 *
 * @returns New object with mapped values.
 */
export const mapObjVals = <T1, T2>(
  fn: (val: T1, key: string) => T2,
  obj: { [key: string]: T1 },
): { [key: string]: T2 } => {
  const result: { [key: string]: T2 } = {}

  for (const key in obj) result[key] = fn(obj[key], key)

  return result
}

/**
 * Maps values of an object to new values.
 *
 * @param fn Function that maps a value and key to a new value.
 * @param obj Object to map to a new object.
 *
 * @returns New object with mapped values.
 */
export const mapObjValsP = async <T1, T2>(
  fn: (val: T1, key: string) => Promise<T2>,
  obj: { [key: string]: T1 },
): Promise<{ [key: string]: T2 }> => {
  const result: { [key: string]: T2 } = {}

  const keys = Object.keys(obj)
  await Promise.all(
    keys.map(async (key) => {
      result[key] = await fn(obj[key], key)
    }),
  )

  return result
}

/**
 * Returns true if the provided object has no keys, false otherwise.
 *
 * @param obj Object to check.
 *
 * @returns `true` if `obj` has no keys, `false` otherwise.
 */
export const isEmptyObj = (obj: object) => {
  for (const _ in obj) return false
  return true
}

/**
 * Returns a valid GraphQL type name for a Prismic schema.
 *
 * @param apiId API ID of the schema.
 *
 * @returns Type name for the schema.
 */
export const buildSchemaTypeName = (apiId: string) =>
  pascalCase(`Prismic ${apiId}`, { transform: pascalCaseTransformMerge })

/**
 * Determines whether the current context is the browser.
 *
 * @returns `true` if the current context is the browser, `false` otherwise.
 */
export const isBrowser = typeof window !== 'undefined'

export const getComponentDisplayName = (
  WrappedComponent: React.ComponentType<any>,
) => WrappedComponent.displayName || WrappedComponent.name || 'Component'

/**
 * Separates an array in to an array of arrays
 * @param arr The array to chunk
 * @param size the maximum size for each of the resulting arrays
 */
export function chunk<T>(arr: T[], size: number): Array<T[]> {
  const chunks = []

  let i = 0

  while (i < arr.length) {
    const a = arr.slice(i, (i += size))
    chunks.push(a)
  }

  return chunks
}
