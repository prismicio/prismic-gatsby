// eslint-disable-next-line @typescript-eslint/ban-types
export const createGetProxy = <T extends object>(
  target: T,
  get: ProxyHandler<T>['get'],
): T => new Proxy(target, { get })
