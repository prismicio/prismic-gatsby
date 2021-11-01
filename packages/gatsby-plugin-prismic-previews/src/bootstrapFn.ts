import * as React from "react";
import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";
import * as gatsbyPrismic from "gatsby-source-prismic";
import * as cookie from "es-cookie";

import { extractPreviewRefRepositoryName } from "./lib/extractPreviewRefRepositoryName";
import { fetchTypePaths } from "./lib/fetchTypePaths";
import { mergeRepositoryConfigs } from "./lib/mergeRepositoryConfigs";
import { sprintf } from "./lib/sprintf";

import { FetchLike, PrismicRepositoryConfig } from "./types";
import {
	MISSING_PLUGIN_OPTIONS_MSG,
	MISSING_REPOSITORY_CONFIG_MSG,
} from "./constants";
import { ActionKind, PrismicContextType, StateKind } from "./context";

type BootstrapConfig = {
	contextStateRef: React.MutableRefObject<PrismicContextType[0]>;
	contextDispatch: PrismicContextType[1];
	repositoryConfigs?: PrismicRepositoryConfig[];
	fetch?: FetchLike;
};

export const prismicPreviewBootstrap = async (
	config: BootstrapConfig,
): Promise<void> => {
	if (
		config.contextStateRef.current.state !== StateKind.Init &&
		config.contextStateRef.current.state !== StateKind.Resolved
	) {
		// No op. Bootstrapping should only happen once.
		return;
	}

	const previewRef = cookie.get(prismic.cookie.preview);
	const repositoryName = previewRef
		? extractPreviewRefRepositoryName(previewRef)
		: undefined;

	if (!repositoryName) {
		return config.contextDispatch({
			type: ActionKind.NotAPreview,
		});
	}

	const mergedRepositoryConfigs = mergeRepositoryConfigs(
		config.contextStateRef.current.repositoryConfigs,
		config.repositoryConfigs || [],
	);
	const repositoryConfig = mergedRepositoryConfigs.find(
		(config) => config.repositoryName === repositoryName,
	);
	if (!repositoryConfig) {
		return config.contextDispatch({
			type: ActionKind.Failed,
			payload: {
				error: new Error(
					sprintf(MISSING_REPOSITORY_CONFIG_MSG, repositoryName),
				),
			},
		});
	}

	const pluginOptions =
		config.contextStateRef.current.pluginOptionsStore[repositoryName];
	if (!pluginOptions) {
		return config.contextDispatch({
			type: ActionKind.Failed,
			payload: {
				error: new Error(sprintf(MISSING_PLUGIN_OPTIONS_MSG, repositoryName)),
			},
		});
	}

	const runtime =
		config.contextStateRef.current.runtimeStore[repositoryName] ||
		gatsbyPrismic.createRuntime();
	runtime.config = {
		linkResolver: repositoryConfig.linkResolver || runtime.config.linkResolver,
		htmlSerializer:
			repositoryConfig.htmlSerializer || runtime.config.htmlSerializer,
		typePrefix: pluginOptions.typePrefix || runtime.config.typePrefix,
		transformFieldName:
			repositoryConfig.transformFieldName || runtime.config.transformFieldName,
		imageImgixParams:
			pluginOptions.imageImgixParams || runtime.config.imageImgixParams,
		imagePlaceholderImgixParams:
			pluginOptions.imagePlaceholderImgixParams ||
			runtime.config.imagePlaceholderImgixParams,
	};

	config.contextDispatch({
		type: ActionKind.RegisterRuntime,
		payload: {
			repositoryName,
			runtime,
		},
	});

	config.contextDispatch({
		type: ActionKind.StartBootstrapping,
		payload: { repositoryName },
	});

	try {
		const typePaths = await fetchTypePaths({
			repositoryName: repositoryName,
			fetch: config.fetch,
		});

		runtime.importTypePaths(typePaths);
	} catch (error) {
		config.contextDispatch({
			type: ActionKind.Failed,
			payload: { error: error as Error },
		});
	}

	const endpoint =
		pluginOptions.apiEndpoint || prismic.getEndpoint(repositoryName);
	const client = prismic.createClient(endpoint, {
		accessToken: pluginOptions.accessToken,
		defaultParams: {
			lang: pluginOptions.lang,
			fetchLinks: pluginOptions.fetchLinks,
			graphQuery: pluginOptions.graphQuery,
		},
		fetch: config.fetch,
	});

	let allDocuments: prismicT.PrismicDocument[];
	try {
		allDocuments = await client.getAll();
	} catch (error) {
		return config.contextDispatch({
			type: ActionKind.Failed,
			payload: { error: error as Error },
		});
	}

	runtime.registerDocuments(allDocuments);

	config.contextDispatch({
		type: ActionKind.Bootstrapped,
	});
};
