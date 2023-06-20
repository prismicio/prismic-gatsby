import type { PluginOptions } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

export const getPluginOptions = (
	repositoryName: string,
): PluginOptions | undefined => {
	const state = usePrismicPreviewStore.getState();

	return state.pluginOptions[repositoryName];
};
