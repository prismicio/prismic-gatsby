import * as gatsby from "gatsby";
import * as prismic from "@prismicio/client";
import * as gatsbyFs from "gatsby-source-filesystem";
import { createNodeHelpers } from "gatsby-node-helpers";

import { GLOBAL_TYPE_PREFIX } from "./constants";
import { Dependencies, PluginOptions } from "./types";
import { createRuntime } from "./runtime";
import { sprintf } from "./lib/sprintf";
import { REPORTER_TEMPLATE } from ".";

const defaultTransformFieldName = (fieldName: string) =>
	fieldName.replace(/-/g, "_");

/**
 * Build the dependencies used by functions throughout the plugin.
 *
 * This collection of dependencies is shared through the use of the `fp-ts/Reader` monad.
 *
 * @param gatsbyContext - Arguments provided to Gatsby's Node APIs.
 * @param pluginOptions - The plugin instance's options.
 *
 * @returns Dependencies used throughout the plugin.
 * @see https://gcanti.github.io/fp-ts/modules/Reader.ts.html
 */
export const buildDependencies = async (
	gatsbyContext: gatsby.NodePluginArgs,
	pluginOptions: PluginOptions,
): Promise<Dependencies> => {
	const prismicClient = prismic.createClient(pluginOptions.apiEndpoint, {
		fetch: pluginOptions.fetch,
		accessToken: pluginOptions.accessToken,
		routes: pluginOptions.routes,
		defaultParams: {
			lang: pluginOptions.lang,
			fetchLinks: pluginOptions.fetchLinks,
			graphQuery: pluginOptions.graphQuery,
			pageSize: pluginOptions.pageSize,
		},
	});

	if (pluginOptions.releaseID) {
		prismicClient.queryContentFromReleaseByID(pluginOptions.releaseID);
	}

	const transformFieldName =
		pluginOptions.transformFieldName || defaultTransformFieldName;

	return {
		pluginOptions,
		prismicClient,
		webhookBody: gatsbyContext.webhookBody,
		createNode: gatsbyContext.actions.createNode,
		createTypes: gatsbyContext.actions.createTypes,
		touchNode: gatsbyContext.actions.touchNode,
		deleteNode: gatsbyContext.actions.deleteNode,
		createNodeId: gatsbyContext.createNodeId,
		createContentDigest: gatsbyContext.createContentDigest,
		reporter: gatsbyContext.reporter,
		reportInfo: gatsbyContext.reporter.info,
		reportWarning: gatsbyContext.reporter.warn,
		reportVerbose: gatsbyContext.reporter.verbose,
		buildUnionType: gatsbyContext.schema.buildUnionType,
		buildObjectType: gatsbyContext.schema.buildObjectType,
		buildEnumType: gatsbyContext.schema.buildEnumType,
		buildInterfaceType: gatsbyContext.schema.buildInterfaceType,
		buildScalarType: gatsbyContext.schema.buildScalarType,
		getNode: gatsbyContext.getNode,
		getNodes: gatsbyContext.getNodes,
		schema: gatsbyContext.schema,
		store: gatsbyContext.store,
		cache: gatsbyContext.cache,
		globalNodeHelpers: createNodeHelpers({
			typePrefix: GLOBAL_TYPE_PREFIX,
			createNodeId: gatsbyContext.createNodeId,
			createContentDigest: gatsbyContext.createContentDigest,
		}),
		nodeHelpers: createNodeHelpers({
			typePrefix: [GLOBAL_TYPE_PREFIX, pluginOptions.typePrefix]
				.filter(Boolean)
				.join(" "),
			fieldPrefix: GLOBAL_TYPE_PREFIX,
			createNodeId: gatsbyContext.createNodeId,
			createContentDigest: gatsbyContext.createContentDigest,
		}),
		createRemoteFileNode:
			pluginOptions.createRemoteFileNode || gatsbyFs.createRemoteFileNode,
		transformFieldName,
		runtime: createRuntime({
			typePrefix: GLOBAL_TYPE_PREFIX,
			linkResolver: pluginOptions.linkResolver,
			imageImgixParams: pluginOptions.imageImgixParams,
			imagePlaceholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
			htmlSerializer: pluginOptions.htmlSerializer,
			transformFieldName,
		}),

		sourceNodesTimer: gatsbyContext.reporter.activityTimer(
			sprintf(REPORTER_TEMPLATE, pluginOptions.repositoryName, "Source nodes"),
		),
	};
};
