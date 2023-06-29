export const withoutURLParameter = (url: string, key: string): string => {
	const instance = new URL(url);

	instance.searchParams.delete(key);

	return instance.toString();
};
