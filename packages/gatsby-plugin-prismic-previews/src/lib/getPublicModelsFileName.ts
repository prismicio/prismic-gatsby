import type { GatsbyCache } from "gatsby";
import { createContentDigest } from "gatsby-core-utils";

import { PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY } from "../constants";

export const getPublicModelsFileName = async (
	cache: GatsbyCache,
): Promise<string> => {
	let seed: string = await cache.get(PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY);

	if (!seed) {
		seed = Date.now().toString();

		await cache.set(PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY, seed);
	}

	return `${createContentDigest(seed)}.json`;
};
