/**
 * Sanitizes an image URL. The following steps are taken:
 *
 * - Replace `+` in filename with a space
 * - Decode the URL
 *
 * @param url Image URL to sanitize.
 *
 * @return Sanitized image URL.
 *
 * @deprecated This is a temporary solution until the Prismic API properly handles spaces in filenames.
 */
// TODO: Remove once the Prismic API properly handles spaces in filenames
export const sanitizeImageURL = (url: string): string =>
  decodeURIComponent(url.replace(/\+/g, ' '))
