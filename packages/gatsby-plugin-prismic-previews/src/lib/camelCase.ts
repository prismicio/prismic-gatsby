import * as cc from "camel-case";

/**
 * Converts a collection of strings to a single camel cased string.
 *
 * @param parts - Strings to convert into a single camel cased string.
 *
 * @returns Camel cased string version of `parts`.
 */
export const camelCase = (...parts: (string | null | undefined)[]): string =>
	cc.camelCase(parts.filter((p) => p != null).join(" "), {
		transform: cc.camelCaseTransformMerge,
	});
