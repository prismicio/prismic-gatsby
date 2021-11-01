import { PrismicRepositoryConfig } from "../types";

export const mergeRepositoryConfigs = (
	a: PrismicRepositoryConfig[],
	b: PrismicRepositoryConfig[],
): PrismicRepositoryConfig[] => {
	let result = a;

	for (const overrideConfig of b) {
		const existingIndex = result.findIndex(
			(config) => config.repositoryName === overrideConfig.repositoryName,
		);

		if (existingIndex !== -1) {
			result[existingIndex] = {
				...result[existingIndex],
				...overrideConfig,
			};
		} else {
			result = [...result, overrideConfig];
		}
	}

	return result;
};
