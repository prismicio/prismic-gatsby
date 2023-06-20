type BuildPreviewRefArgs = {
	repositoryName: string;
	isRelease?: boolean;
};

export const buildPreviewRef = (args: BuildPreviewRefArgs): string => {
	return JSON.stringify({
		[`${args.repositoryName}.prismic.io`]: {
			preview: `https://${args.repositoryName}.prismic.io/previews/foo${
				args.isRelease ? "~" : ":"
			}bar?websitePreviewId%3Dbaz`,
		},
	});
};
