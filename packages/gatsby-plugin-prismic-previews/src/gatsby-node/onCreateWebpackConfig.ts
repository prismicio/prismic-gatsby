import type { CreateWebpackConfigArgs } from "gatsby";

import { getPublicModelsFileName } from "../lib/getPublicModelsFileName";

import type { PluginOptions } from "../types";

export const onCreateWebpackConfig = async (
	args: CreateWebpackConfigArgs,
	_options: PluginOptions,
): Promise<void> => {
	const publicModelsFileName = await getPublicModelsFileName(args.cache);

	args.actions.setWebpackConfig({
		plugins: [
			args.plugins.define({
				__PUBLIC_MODELS_PATH__: JSON.stringify(
					`/static/${publicModelsFileName}`,
				),
			}),
		],
	});
};
