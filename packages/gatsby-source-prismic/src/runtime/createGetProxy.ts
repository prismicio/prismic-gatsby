/**
 * Symbol used to identify if a value is a proxy. Attach this to proxies (done
 * automatically via `lib/createGetProxy`).
 */
export const IS_PROXY = Symbol('IS_PROXY')

// eslint-disable-next-line @typescript-eslint/ban-types
export const createGetProxy = <T extends object>(
  target: T,
  get: ProxyHandler<T>['get'],
): T => {
  // @ts-expect-error - We are forcibly adding this "is proxy" property
  target[IS_PROXY] = true

  return new Proxy(target, { get })
}
