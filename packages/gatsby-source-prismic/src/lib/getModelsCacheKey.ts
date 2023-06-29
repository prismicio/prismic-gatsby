type GetModelsCacheKeyArgs = {
	repositoryName: string;
};

export const getModelsCacheKey = (args: GetModelsCacheKeyArgs): string => {
	return `${args.repositoryName}:models`;
};
