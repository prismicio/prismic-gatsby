import type { BrowserPluginArgs } from "gatsby";

import type { PluginOptions } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

export const onClientEntry = (
	_args: BrowserPluginArgs,
	options: PluginOptions,
): void => {
	const state = usePrismicPreviewStore.getState();

	state.addPluginOptions(options);
};
