export const fmtLog = (repositoryName: string, text: string): string => {
	return `gatsby-source-prismic(${repositoryName}) - ${text}`;
};
