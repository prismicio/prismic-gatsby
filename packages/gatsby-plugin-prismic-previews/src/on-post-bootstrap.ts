import * as gatsby from "gatsby";
import * as path from "path";
import * as gatsbyPrismic from "gatsby-source-prismic";
import md5 from "tiny-hashes/md5";

import { sprintf } from "./lib/sprintf";

import {
	TYPE_PATHS_MISSING_NODE_MSG,
	WROTE_TYPE_PATHS_TO_FS_MSG,
	REPORTER_TEMPLATE,
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
	const typePathsExportStore = await gatsbyPrismic.getExportedTypePathsStore({
		// TODO: Remove type once this issue is resolved: https://github.com/gatsbyjs/gatsby/issues/33963
		getCache: gatsbyContext.getCache as (name: string) => gatsby.GatsbyCache,
	});

	if (!(pluginOptions.repositoryName in typePathsExportStore)) {
		gatsbyContext.reporter.panic(
			sprintf(
				REPORTER_TEMPLATE,
				pluginOptions.repositoryName,
				TYPE_PATHS_MISSING_NODE_MSG,
			),
		);
	}

	const filename = `${md5(JSON.stringify(typePathsExportStore))}.json`;
	const publicPath = path.join("public", "static", filename);

	await pluginOptions.writeTypePathsToFilesystem({
		publicPath,
		serializedTypePaths: JSON.stringify(typePathsExportStore),
	});

	gatsbyContext.reporter.verbose(
		sprintf(
			REPORTER_TEMPLATE,
			pluginOptions.repositoryName,
			sprintf(WROTE_TYPE_PATHS_TO_FS_MSG, publicPath),
		),
	);
};
