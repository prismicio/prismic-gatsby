export const fmtLog = (repositoryName: string, text: string): string => {
	return `gatsby-plugin-prismic-previews(${repositoryName}) - ${text}`;
};
