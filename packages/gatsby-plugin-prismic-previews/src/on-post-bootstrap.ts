import * as gatsby from "gatsby";
import * as gatsbyPrismic from "gatsby-source-prismic";
import * as path from "path";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import * as T from "fp-ts/Task";
import { constVoid, pipe } from "fp-ts/function";
import { createNodeHelpers, NodeHelpers } from "gatsby-node-helpers";

import {
	TYPE_PATHS_MISSING_NODE_MSG,
	WROTE_TYPE_PATHS_TO_FS_MSG,
} from "./constants";
import { PluginOptions } from "./types";
import { sprintf } from "./lib/sprintf";
import { reportPanic } from "./lib/reportPanic";
import { serializeTypePathNodes } from "./lib/serializeTypePathsNodes";
import { reportVerbose, ReportVerboseEnv } from "./lib/reportVerbose";
import {
	buildTypePathsStoreFilename,
	BuildTypePathsStoreFilenameEnv,
} from "./lib/buildTypePathsStoreFilename";

interface OnPostBootstrapProgramEnv
	extends BuildTypePathsStoreFilenameEnv,
		ReportVerboseEnv {
	getNodesByType: gatsby.NodePluginArgs["getNodesByType"];
	repositoryName: string;
	nodeHelpers: NodeHelpers;
	writeTypePathsToFilesystem: PluginOptions["writeTypePathsToFilesystem"];
}

/**
 * To be executed in the `onPostBootstrap` API.
 */
const onPostBootstrapProgram: RTE.ReaderTaskEither<
	OnPostBootstrapProgramEnv,
	Error,
	void
> = pipe(
	RTE.ask<OnPostBootstrapProgramEnv>(),
	RTE.bind("nodes", (env) =>
		RTE.right(
			env.getNodesByType(
				env.nodeHelpers.createTypeName("TypePathType"),
			) as gatsbyPrismic.TypePathNode[],
		),
	),
	RTE.chainW(
		RTE.fromPredicate(
			(env) => A.isNonEmpty(env.nodes),
			() => new Error(TYPE_PATHS_MISSING_NODE_MSG),
		),
	),
	RTE.bind("serializedTypePaths", (env) =>
		RTE.right(serializeTypePathNodes(env.nodes)),
	),
	RTE.bindW("filename", () => buildTypePathsStoreFilename),
	RTE.bind("publicPath", (env) =>
		RTE.right(path.join("public", "static", env.filename)),
	),
	RTE.chainFirst((env) =>
		RTE.fromTaskEither(
			TE.tryCatch(
				() =>
					Promise.resolve(
						env.writeTypePathsToFilesystem({
							publicPath: env.publicPath,
							serializedTypePaths: env.serializedTypePaths,
						}),
					),
				(error) => error as Error,
			),
		),
	),
	RTE.chainFirstW((env) =>
		reportVerbose(sprintf(WROTE_TYPE_PATHS_TO_FS_MSG, env.publicPath)),
	),
	RTE.map(constVoid),
);

/**
 * Called at the end of the bootstrap process after all other extension APIs
 * have been called.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#onPostBootstrap
 */
// This needs to be written in thenable syntax to satisfy Gatsby's API.
// The TypeScript types say this function only supports the callback method,
// not the Promise-returning method.
export const onPostBootstrap: NonNullable<
	gatsby.GatsbyNode["onPostBootstrap"]
> = async (gatsbyContext, pluginOptions: PluginOptions, callback) =>
	await pipe(
		onPostBootstrapProgram({
			getNodesByType: gatsbyContext.getNodesByType,
			reportVerbose: gatsbyContext.reporter.verbose,
			repositoryName: pluginOptions.repositoryName,
			nodeHelpers: createNodeHelpers({
				typePrefix: [gatsbyPrismic.GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
					.filter(Boolean)
					.join(" "),
				fieldPrefix: gatsbyPrismic.GLOBAL_TYPE_PREFIX,
				createNodeId: gatsbyContext.createNodeId,
				createContentDigest: gatsbyContext.createContentDigest,
			}),
			writeTypePathsToFilesystem: pluginOptions.writeTypePathsToFilesystem,
		}),
		TE.fold(
			(error) =>
				pipe(
					reportPanic(error.message)({
						repositoryName: pluginOptions.repositoryName,
						reportPanic: gatsbyContext.reporter.panic,
					}),
					TE.fold(
						() => T.of(void 0),
						() => T.of(void 0),
					),
				),
			() => (callback ? T.fromIO(() => callback(null)) : T.of(void 0)),
		),
	)();
