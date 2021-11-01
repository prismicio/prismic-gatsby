export const getURLSearchParam = (key: string): string | undefined => {
	const params = new URLSearchParams(window.location.search);

	return params.get(key) ?? undefined;
};
