import * as E from "fp-ts/Either";

import { FetchLike } from "../types";

type FetchTypePathsConfig = {
	repositoryName: string;
	fetch?: FetchLike;
};

export const fetchTypePaths = async (
	config: FetchTypePathsConfig,
): Promise<E.Either<Error, string>> => {
	const url = __GATSBY_PLUGIN_PRISMIC_PREVIEWS_TYPE_PATHS_URL__;
	const fetchFn = config.fetch || globalThis.fetch;

	try {
		const res = await fetchFn(url);
		const json: Record<string, string> = await res.json();
		const typePaths = json[config.repositoryName];

		if (typePaths) {
			return E.right(typePaths);
		} else {
			return E.left(
				new Error(
					`Type paths for ${config.repositoryName} were not included in the export.`,
				),
			);
		}
	} catch (error) {
		return E.left(error as Error);
	}
};
