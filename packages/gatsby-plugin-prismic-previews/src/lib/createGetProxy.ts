import { IS_PROXY } from "../constants";

// eslint-disable-next-line @typescript-eslint/ban-types
export const createGetProxy = <T extends object>(
	target: T,
	get: ProxyHandler<T>["get"],
): T => {
	// @ts-expect-error - We are forcibly adding this "is proxy" property
	target[IS_PROXY] = true;

	return new Proxy(target, { get });
};
