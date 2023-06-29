const readValue = (value: string): string => {
	return value.replace(/%3B/g, ";");
};

/**
 * Returns the value of a cookie from a given cookie store.
 *
 * @returns The value of the cookie, if it exists.
 */
export const getPreviewCookie = (): string | undefined => {
	const cookies = document.cookie.split("; ");

	for (const cookie of cookies) {
		const parts = cookie.split("=");
		const thisName = readValue(parts[0]).replace(/%3D/g, "=");

		// The Prismic preview cookie name is hardcoded here to prevent
		// including `@prismicio/client` in the main "app.js" bundle.
		// Unfortunately, the package is not tree-shaken when only the
		// cookie name is imported.
		if (thisName === "io.prismic.preview") {
			const value = parts.slice(1).join("=");

			return readValue(value);
		}
	}
};
