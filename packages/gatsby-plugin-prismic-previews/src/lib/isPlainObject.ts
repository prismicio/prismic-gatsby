import { UnknownRecord } from 'gatsby-prismic-core'

/**
 * Get the string tag of a value.
 * @private
 *
 * @param  value
 */
const getTag = <T>(value: T): string => Object.prototype.toString.call(value)

/**
 * Returns true if given value is an instance of Map or Set.
 * @private
 *
 * @param value Value to check.
 */
const isMapOrSet = <T>(value: T): boolean => {
  const tag = getTag(value)

  return tag === '[object Set]' || tag === '[object Map]'
}

/**
 * Determines if an object is a plain object.
 *
 * @param value The value to check.
 *
 * @returns true if value is a plain object, false otherwise.
 */
export const isPlainObject = (value: unknown): value is UnknownRecord =>
  isMapOrSet(value)
    ? false
    : value !== null && typeof value === 'object' && !Array.isArray(value)
