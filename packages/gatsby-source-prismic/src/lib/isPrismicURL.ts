/**
 * Determines if a given URL is a valid Prismic URL.
 *
 * @param url - URL to test.
 */
export const isPrismicURL = (url: string): boolean =>
	/^https?:\/\/([^.]+)\.(wroom\.(?:test|io)|prismic\.io)\/api\/?/.test(url);
