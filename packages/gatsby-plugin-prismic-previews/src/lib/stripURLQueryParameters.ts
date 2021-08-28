import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

/**
 * Removes query parameters from a URL. If the URL is invalid, the input is
 * returned as is.
 *
 * @param url - URL from which to remove query parameters.
 *
 * @returns `url` without query parameters.
 */
export const stripURLQueryParameters = (url: string): string =>
	pipe(
		O.tryCatch(() => new URL(url)),
		O.map((instance) => `${instance.origin}${instance.pathname}`),
		O.getOrElse(() => url),
	);
