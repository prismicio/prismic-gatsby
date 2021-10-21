import * as React from "react";
import * as prismic from "@prismicio/client";
import * as O from "fp-ts/Option";
import * as cookie from "es-cookie";

import { extractPreviewRefRepositoryName } from "./lib/extractPreviewRefRepositoryName";
import { sprintf } from "./lib/sprintf";

import { FetchLike, PrismicRepositoryConfigs } from "./types";
import {
	MISSING_PLUGIN_OPTIONS_MSG,
	MISSING_REPOSITORY_CONFIG_MSG,
} from "./constants";
import {
	PrismicContextActionType,
	PrismicContextState,
	PrismicPreviewState,
} from "./context";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";
import { getURLSearchParam } from "./lib/getURLSearchParam";

export type UsePrismicPreviewResolverConfig = {
	fetch?: FetchLike;
};

export type UsePrismicPreviewResolverFn = () => Promise<void>;

export const usePrismicPreviewResolver = (
	repositoryConfigs: PrismicRepositoryConfigs = [],
	config: UsePrismicPreviewResolverConfig = {},
): UsePrismicPreviewResolverFn => {
	const [contextState, contextDispatch] = usePrismicPreviewContext();

	const contextStateRef = React.useRef<PrismicContextState>(contextState);

	// We need to update the ref anytime contextState changes to ensure lazy
	// functions get the latest data.
	React.useEffect(() => {
		contextStateRef.current = contextState;
	}, [contextState]);

	return React.useCallback(async (): Promise<void> => {
		if (contextStateRef.current.previewState !== PrismicPreviewState.IDLE) {
			// No op. Resolving should only happen at IDLE.
			return;
		}

		const previewRef = cookie.get(prismic.cookie.preview);
		const documentId = getURLSearchParam("documentId");
		const repositoryName = previewRef
			? extractPreviewRefRepositoryName(previewRef)
			: O.none;

		if (O.isNone(documentId) || O.isNone(repositoryName)) {
			return contextDispatch({
				type: PrismicContextActionType.NotAPreview,
			});
		}

		contextDispatch({
			type: PrismicContextActionType.SetActiveRepositoryName,
			payload: { repositoryName: repositoryName.value },
		});

		// TODO: Deeply merge repository configs
		const resolvedRepositoryConfigs = [
			...repositoryConfigs,
			...contextState.repositoryConfigs,
		];
		const repositoryConfig = resolvedRepositoryConfigs.find(
			(config) => config.repositoryName === repositoryName.value,
		);
		if (!repositoryConfig) {
			return contextDispatch({
				type: PrismicContextActionType.Failed,
				payload: {
					error: new Error(
						sprintf(
							MISSING_REPOSITORY_CONFIG_MSG,
							repositoryName.value,
							"withPrismicPreview and withPrismicUnpublishedPreview",
						),
					),
				},
			});
		}

		const repositoryPluginOptions =
			contextState.pluginOptionsStore[repositoryName.value];
		if (!repositoryPluginOptions) {
			return contextDispatch({
				type: PrismicContextActionType.Failed,
				payload: {
					error: new Error(
						sprintf(MISSING_PLUGIN_OPTIONS_MSG, repositoryName.value),
					),
				},
			});
		}

		// Begin resolving stage.
		contextDispatch({
			type: PrismicContextActionType.StartResolving,
		});

		const endpoint =
			repositoryPluginOptions.apiEndpoint ??
			prismic.getEndpoint(repositoryName.value);
		const client = prismic.createClient(endpoint, {
			accessToken: repositoryPluginOptions.accessToken,
			defaultParams: {
				lang: repositoryPluginOptions.lang,
				fetchLinks: repositoryPluginOptions.fetchLinks,
				graphQuery: repositoryPluginOptions.graphQuery,
			},
			fetch: config.fetch,
		});
		client.enableAutoPreviews();

		let path: string;
		try {
			path = await client.resolvePreviewURL({
				linkResolver: repositoryConfig.linkResolver,
				defaultURL: "/",
			});
		} catch (error) {
			if (
				error instanceof prismic.ForbiddenError &&
				repositoryPluginOptions.promptForAccessToken
			) {
				return contextDispatch({
					type: PrismicContextActionType.PromptForAccessToken,
				});
			} else {
				return contextDispatch({
					type: PrismicContextActionType.Failed,
					payload: { error: error as Error },
				});
			}
		}

		contextDispatch({
			type: PrismicContextActionType.Resolved,
			payload: { path },
		});
	}, [
		contextDispatch,
		contextState.pluginOptionsStore,
		contextState.repositoryConfigs,
		repositoryConfigs,
		config.fetch,
	]);
};
