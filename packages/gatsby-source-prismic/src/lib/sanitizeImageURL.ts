/**
 * Sanitizes an image URL. The following steps are taken:
 *
 * - Replace `+` in filename with a space
 * - Decode the URL
 *
 * @deprecated This is a temporary solution until the Prismic API properly
 *   handles spaces in filenames.
 * @param url - Image URL to sanitize.
 *
 * @returns Sanitized image URL.
 */
// TODO: Remove once the Prismic API properly handles spaces in filenames
export const sanitizeImageURL = (url: string): string =>
	decodeURIComponent(url.replace(/\+/g, " "));
