import { UnknownRecord } from "../types";

/**
 * Get the string tag of a value.
 *
 * @param value - Value from which to get the string tag.
 */
const getTag = <T>(value: T): string => Object.prototype.toString.call(value);

/**
 * Returns true if given value is an instance of Map or Set.
 *
 * @param value - Value to check.
 */
const isMapOrSet = <T>(value: T): boolean => {
	const tag = getTag(value);

	return tag === "[object Set]" || tag === "[object Map]";
};

/**
 * Determines if an object is a plain object.
 *
 * @param value - The value to check.
 *
 * @returns True if value is a plain object, false otherwise.
 */
export const isPlainObject = <T = UnknownRecord>(value: unknown): value is T =>
	isMapOrSet(value)
		? false
		: value !== null && typeof value === "object" && !Array.isArray(value);
