import { IS_PROXY } from '../constants'

/**
 * Determines if a value is a Proxy. The value must have the `IS_PROXY` property
 * set.
 *
 * @param value Value to test.
 *
 * @returns `true` if `value` is a Proxy, `false` otherwise.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isProxy = <T extends object>(value: T): boolean =>
  Boolean(
    // @ts-expect-error - We are forcibly adding this "is proxy" property
    value[IS_PROXY],
  )
