import * as React from "react";
import * as prismic from "@prismicio/client";
import * as cookie from "es-cookie";

import { extractPreviewRefRepositoryName } from "./lib/extractPreviewRefRepositoryName";
import { getURLSearchParam } from "./lib/getURLSearchParam";
import { mergeRepositoryConfigs } from "./lib/mergeRepositoryConfigs";
import { sprintf } from "./lib/sprintf";

import { FetchLike, PrismicRepositoryConfig } from "./types";
import { ActionKind, StateKind } from "./context";
import {
	MISSING_PLUGIN_OPTIONS_MSG,
	MISSING_REPOSITORY_CONFIG_MSG,
} from "./constants";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";

export type UsePrismicPreviewResolverConfig = {
	fetch?: FetchLike;
};

export type UsePrismicPreviewResolverReturnType = {
	resolvePreview: () => Promise<void>;
	uncheckedResolvePreview: () => Promise<void>;
};

export const usePrismicPreviewResolver = (
	repositoryConfigs: PrismicRepositoryConfig[] = [],
	config: UsePrismicPreviewResolverConfig = {},
): UsePrismicPreviewResolverReturnType => {
	const [contextState, contextDispatch] = usePrismicPreviewContext();

	// We will access the context state via a ref to ensure we always have
	// the latest value. This is necessary since we will be updating state
	// within the the returned callback function. If a ref was not used,
	// our context state would be stale.
	const contextStateRef = React.useRef(contextState);
	React.useEffect(() => {
		contextStateRef.current = contextState;
	}, [contextState]);

	const uncheckedResolvePreview = React.useCallback(async (): Promise<void> => {
		const previewRef = cookie.get(prismic.cookie.preview);
		const repositoryName = previewRef
			? extractPreviewRefRepositoryName(previewRef)
			: undefined;
		const documentId = getURLSearchParam("documentId");

		if (!repositoryName || !documentId) {
			return contextDispatch({
				type: ActionKind.NotAPreview,
			});
		}

		const mergedRepositoryConfigs = mergeRepositoryConfigs(
			contextStateRef.current.repositoryConfigs,
			repositoryConfigs,
		);
		const repositoryConfig = mergedRepositoryConfigs.find(
			(config) => config.repositoryName === repositoryName,
		);
		if (!repositoryConfig) {
			return contextDispatch({
				type: ActionKind.Failed,
				payload: {
					error: new Error(
						sprintf(MISSING_REPOSITORY_CONFIG_MSG, repositoryName),
					),
				},
			});
		}

		const pluginOptions =
			contextStateRef.current.pluginOptionsStore[repositoryName];
		if (!pluginOptions) {
			return contextDispatch({
				type: ActionKind.Failed,
				payload: {
					error: new Error(sprintf(MISSING_PLUGIN_OPTIONS_MSG, repositoryName)),
				},
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

		contextDispatch({
			type: ActionKind.StartResolving,
			payload: { repositoryName },
		});

		let resolvedURL: string;
		try {
			resolvedURL = await client.resolvePreviewURL({
				linkResolver: repositoryConfig.linkResolver,
				defaultURL: "/",
			});
		} catch (error) {
			return contextDispatch({
				type: ActionKind.Failed,
				payload: { error: error as Error },
			});
		}

		contextDispatch({
			type: ActionKind.Resolved,
			payload: { resolvedURL },
		});
	}, [repositoryConfigs, config.fetch, contextDispatch]);

	const resolvePreview = React.useCallback(async (): Promise<void> => {
		if (contextStateRef.current.state !== StateKind.Init) {
			// No op. Resolving should only happen at idle.
			return;
		}

		return await uncheckedResolvePreview();
	}, [uncheckedResolvePreview]);

	return React.useMemo(() => {
		return {
			uncheckedResolvePreview,
			resolvePreview,
		};
	}, [uncheckedResolvePreview, resolvePreview]);
};
