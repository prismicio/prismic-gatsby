import type { ImageFieldImage, LinkToMediaField } from "@prismicio/client";

import type { PluginOptions } from "../types";

type ShouldDownloadFileArgs = {
	path: string[];
	field: ImageFieldImage<"filled"> | LinkToMediaField<"filled">;
	pluginOptions: PluginOptions;
};

export const shouldDownloadFile = async (
	args: ShouldDownloadFileArgs,
): Promise<boolean> => {
	const fieldDotPath = args.path.join(".");

	switch (typeof args.pluginOptions.shouldDownloadFiles) {
		case "boolean": {
			return args.pluginOptions.shouldDownloadFiles;
		}

		case "function": {
			return await args.pluginOptions.shouldDownloadFiles(args.field);
		}

		case "object": {
			const predicate = args.pluginOptions.shouldDownloadFiles[fieldDotPath];

			if (predicate) {
				switch (typeof predicate) {
					case "boolean": {
						return predicate;
					}

					case "function": {
						return await predicate(args.field);
					}
				}
			}
		}

		default: {
			return false;
		}
	}
};
