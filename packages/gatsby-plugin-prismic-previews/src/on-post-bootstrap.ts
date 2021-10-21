import * as gatsby from "gatsby";
import * as gatsbyPrismic from "gatsby-source-prismic";
import * as path from "path";
import { createNodeHelpers } from "gatsby-node-helpers";
import md5 from "tiny-hashes/md5";

import { serializeTypePathNodes } from "./lib/serializeTypePathsNodes";
import { sprintf } from "./lib/sprintf";

import {
	TYPE_PATHS_MISSING_NODE_MSG,
	WROTE_TYPE_PATHS_TO_FS_MSG,
	REPORTER_TEMPLATE,
	TYPE_PATHS_BASENAME_TEMPLATE,
} from "./constants";
import { PluginOptions } from "./types";

/**
 * Called at the end of the bootstrap process after all other extension APIs
 * have been called.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onPostBootstrap
 */
export const onPostBootstrap: NonNullable<
	gatsby.GatsbyNode["onPostBootstrap"]
> = async (gatsbyContext, pluginOptions: PluginOptions) => {
	const nodeHelpers = createNodeHelpers({
		typePrefix: [gatsbyPrismic.GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
			.filter(Boolean)
			.join(" "),
		fieldPrefix: gatsbyPrismic.GLOBAL_TYPE_PREFIX,
		createNodeId: gatsbyContext.createNodeId,
		createContentDigest: gatsbyContext.createContentDigest,
	});

	const typePathNodes = gatsbyContext.getNodesByType(
		nodeHelpers.createTypeName("TypePathType"),
	) as gatsbyPrismic.TypePathNode[];

	if (typePathNodes.length < 1) {
		gatsbyContext.reporter.panic(
			sprintf(
				REPORTER_TEMPLATE,
				pluginOptions.repositoryName,
				TYPE_PATHS_MISSING_NODE_MSG,
			),
		);
	}

	const serializedTypePaths = serializeTypePathNodes(typePathNodes);

	const filename = `${md5(
		sprintf(TYPE_PATHS_BASENAME_TEMPLATE, pluginOptions.repositoryName),
	)}.json`;
	const publicPath = path.join("public", "static", filename);

	await pluginOptions.writeTypePathsToFilesystem({
		publicPath,
		serializedTypePaths,
	});

	gatsbyContext.reporter.verbose(
		sprintf(
			REPORTER_TEMPLATE,
			pluginOptions.repositoryName,
			sprintf(WROTE_TYPE_PATHS_TO_FS_MSG, publicPath),
		),
	);
};
