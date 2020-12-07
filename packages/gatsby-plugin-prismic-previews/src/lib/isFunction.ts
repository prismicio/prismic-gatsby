/**
 * Determines whether the passed value is a function.
 *
 * @param value The value to check.
 *
 * @returns `true` if value is a function, `false` otherwise.
 */
export const isFunction = (value: unknown): value is Function =>
  Boolean(
    value &&
      (value as Function).constructor &&
      (value as Function).call &&
      (value as Function).apply,
  )
