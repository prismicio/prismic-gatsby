/**
 * Interpolate values into a string using a `sprintf`-like syntax. Each instance
 * of "`%s`" in the string will be replaced with a given value in the order they
 * are given.
 *
 * @param string - String into which values will be interpolated.
 * @param args - Values which will be interpolated into `string`.
 *
 * @returns String with interpolated values.
 * @see https://gist.github.com/rmariuzzo/8761698#gistcomment-2375590
 */
export const sprintf = (string: string, ...args: string[]): string => {
	let i = 0;

	return string.replace(/%s/g, () => args[i++]);
};
