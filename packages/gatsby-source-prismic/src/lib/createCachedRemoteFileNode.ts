import type { NodePluginArgs } from "gatsby";
import type { FileSystemNode } from "gatsby-source-filesystem";
import { createRemoteFileNode } from "gatsby-source-filesystem";

type CreateCachedRemoteFileNodeArgs = {
	url: string;
	gatsbyNodeArgs: NodePluginArgs;
};

export const createCachedRemoteFileNode = async (
	args: CreateCachedRemoteFileNodeArgs,
): Promise<FileSystemNode> => {
	const cacheKey = `remote-file-node___${args.url}`;
	const cachedFileNode: FileSystemNode = await args.gatsbyNodeArgs.cache.get(
		cacheKey,
	);

	if (cachedFileNode) {
		args.gatsbyNodeArgs.actions.touchNode(cachedFileNode);

		return cachedFileNode;
	} else {
		const fileNode = await createRemoteFileNode({
			createNode: args.gatsbyNodeArgs.actions.createNode,
			createNodeId: args.gatsbyNodeArgs.createNodeId,
			url: args.url,
			cache: args.gatsbyNodeArgs.cache,
		});

		args.gatsbyNodeArgs.cache.set(cacheKey, fileNode);

		return fileNode;
	}
};
