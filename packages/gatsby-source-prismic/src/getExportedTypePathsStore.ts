import * as gatsby from "gatsby";
import { TYPE_PATHS_EXPORTS_CACHE_KEY } from "./constants";

type GetExportedTypePathsStoreArgs = {
	// TODO: Replace type with one from gatsby
	// Related issue: https://github.com/gatsbyjs/gatsby/issues/33963
	getCache: (name: string) => gatsby.GatsbyCache;
};

export const getExportedTypePathsStore = async (
	args: GetExportedTypePathsStoreArgs,
): Promise<Record<string, string>> => {
	const cache = args.getCache("gatsby-source-prismic");

	const store: Record<string, string> =
		(await cache.get(TYPE_PATHS_EXPORTS_CACHE_KEY)) || {};

	return store;
};
