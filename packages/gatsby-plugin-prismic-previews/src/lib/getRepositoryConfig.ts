import type { RepositoryConfig } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

export const getRepositoryConfig = (
	repositoryName: string,
): RepositoryConfig | undefined => {
	const state = usePrismicPreviewStore.getState();

	return state.repositoryConfigs.find(
		(config) => config.repositoryName === repositoryName,
	);
};
