import {
	pascalCase as basePascalCase,
	pascalCaseTransformMerge,
} from "pascal-case";

/**
 * Converts a string to a Pascal cased string.
 *
 * @param input - String to convert into a Pascal cased string.
 *
 * @returns Pascal cased string version of `input`.
 */
export const pascalCase = (...input: (string | undefined)[]): string => {
	return basePascalCase(input.filter(Boolean).join(" "), {
		transform: pascalCaseTransformMerge,
	});
};
