/**
 * Removes a URL parameter from a given URL.
 *
 * @param url - URL to modify.
 * @param paramKey - Key of the URL parameter to remove.
 *
 * @returns `url` without the `paramKey` URL parameter.
 */
export const removeURLParameter = (url: string, paramKey: string) => {
	const instance = new URL(url);

	instance.searchParams.delete(paramKey);

	return instance.toString();
};
