import * as gatsby from "gatsby";
import * as prismic from "@prismicio/client";
import * as gatsbyFs from "gatsby-source-filesystem";
import { createNodeHelpers } from "gatsby-node-helpers";
import fetch from "node-fetch";

import { GLOBAL_TYPE_PREFIX } from "./constants";
import { Dependencies, UnpreparedPluginOptions } from "./types";
import { createRuntime } from "./runtime";
import { preparePluginOptions } from "./lib/preparePluginOptions";

const defaultTransformFieldName = (fieldName: string) =>
	fieldName.replace(/-/g, "_");

/**
 * Build the dependencies used by functions throughout the plugin.
 *
 * This collection of dependencies is shared through the use of the `fp-ts/Reader` monad.
 *
 * @param gatsbyContext - Arguments provided to Gatsby's Node APIs.
 * @param unpreparedPluginOptions - The plugin instance's options.
 *
 * @returns Dependencies used throughout the plugin.
 * @see https://gcanti.github.io/fp-ts/modules/Reader.ts.html
 */
export const buildDependencies = async (
	gatsbyContext: gatsby.NodePluginArgs,
	unpreparedPluginOptions: UnpreparedPluginOptions,
): Promise<Dependencies> => {
	const prismicEndpoint =
		unpreparedPluginOptions.apiEndpoint ??
		prismic.getEndpoint(unpreparedPluginOptions.repositoryName);
	const prismicClient = prismic.createClient(prismicEndpoint, {
		fetch: unpreparedPluginOptions.fetch || fetch,
		accessToken: unpreparedPluginOptions.accessToken,
		defaultParams: {
			lang: unpreparedPluginOptions.lang,
			fetchLinks: unpreparedPluginOptions.fetchLinks,
			graphQuery: unpreparedPluginOptions.graphQuery,
		},
	});

	if (unpreparedPluginOptions.releaseID) {
		prismicClient.queryContentFromReleaseByID(
			unpreparedPluginOptions.releaseID,
		);
	}

	const transformFieldName =
		unpreparedPluginOptions.transformFieldName || defaultTransformFieldName;

	const pluginOptions = await preparePluginOptions(unpreparedPluginOptions);

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
		buildUnionType: gatsbyContext.schema.buildUnionType,
		buildObjectType: gatsbyContext.schema.buildObjectType,
		buildEnumType: gatsbyContext.schema.buildEnumType,
		buildInterfaceType: gatsbyContext.schema.buildInterfaceType,
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
			typePrefix: [GLOBAL_TYPE_PREFIX, unpreparedPluginOptions.typePrefix]
				.filter(Boolean)
				.join(" "),
			fieldPrefix: GLOBAL_TYPE_PREFIX,
			createNodeId: gatsbyContext.createNodeId,
			createContentDigest: gatsbyContext.createContentDigest,
		}),
		createRemoteFileNode:
			unpreparedPluginOptions.createRemoteFileNode ||
			gatsbyFs.createRemoteFileNode,
		transformFieldName,
		runtime: createRuntime({
			typePrefix: GLOBAL_TYPE_PREFIX,
			linkResolver: unpreparedPluginOptions.linkResolver,
			imageImgixParams: unpreparedPluginOptions.imageImgixParams,
			imagePlaceholderImgixParams:
				unpreparedPluginOptions.imagePlaceholderImgixParams,
			htmlSerializer: unpreparedPluginOptions.htmlSerializer,
			transformFieldName,
		}),
	};
};
