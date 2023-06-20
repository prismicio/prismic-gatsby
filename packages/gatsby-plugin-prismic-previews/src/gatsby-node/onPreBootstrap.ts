import * as path from "path";
import type { ParentSpanPluginArgs } from "gatsby";

import { getPublicModelsFileName } from "../lib/getPublicModelsFileName";

import * as fs from "fs/promises";
import { PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY } from "../constants";

export const onPreBootstrap = async (
	args: ParentSpanPluginArgs,
): Promise<void> => {
	const publicModelsFileName = await getPublicModelsFileName(args.cache);

	try {
		await fs.unlink(path.join("public", "static", publicModelsFileName));
	} catch {
		// noop
	}

	await args.cache.del(PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY);
};
