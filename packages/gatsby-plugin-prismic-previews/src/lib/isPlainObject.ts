/**
 * Determines if an object is a plain object.
 *
 * @param value - The value to check.
 *
 * @returns True if value is a plain object, false otherwise.
 */
export const isPlainObject = <
	T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>,
>(
	value: unknown,
): value is T => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};
