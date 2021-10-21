import * as gatsbyPrismic from "gatsby-source-prismic";

export const serializeTypePathNodes = (
	typePathNodes: gatsbyPrismic.TypePathNode[],
): string => {
	return JSON.stringify(
		typePathNodes.map((node) => ({
			kind: node.kind,
			type: node.type,
			path: node.path,
		})),
	);
};
