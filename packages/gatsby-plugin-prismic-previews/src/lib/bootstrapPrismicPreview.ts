import { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import { withAssetPrefix } from "gatsby";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

import { fetchLinkedDocuments } from "./fetchLinkedDocuments";
import { fetchNewDocuments } from "./fetchNewDocuments";
import { fetchPublishedDocumentIDs } from "./fetchPublishedDocumentIDs";
import { fmtLog } from "./fmtLog";
import { getClient } from "./getClient";
import { getPluginOptions } from "./getPluginOptions";
import { getRepositoryConfig } from "./getRepositoryConfig";
import { normalizeDocument } from "./normalizeDocument";

const bootstrapPrismicPreview = async (
	repositoryName: string,
	abortController: AbortController,
): Promise<void> => {
	const state = usePrismicPreviewStore.getState();

	// Only bootstrap once per session
	if (state.isBootstrapped) {
		return;
	}

	const pluginOptions = getPluginOptions(repositoryName);
	if (!pluginOptions) {
		console.error(
			fmtLog(
				repositoryName,
				'Plugin options could not be found. Did you add "gatsby-plugin-prismic-previews" for this repository to your app\'s "gatsby-config.js" file?',
			),
		);

		return;
	}

	const repositoryConfig = getRepositoryConfig(repositoryName);
	if (!repositoryConfig) {
		console.error(
			fmtLog(
				repositoryName,
				'Repository configuration could not be found. Did you add <PrismicPreviewProvider> to your "gatsby-browser.js" and "gatsby-ssr.js"? It must contain a repository configuration object for this repository.',
			),
		);

		return;
	}

	const client = getClient(pluginOptions);

	const signal = abortController.signal;

	// @ts-expect-error - `getCachedRepository()` is a private internal
	// client method. We use it here to manually prime the cached
	// repository cache. This saves us from fetching the repository
	// multiple times when we run queries in parallel in the next block.
	await client.getCachedRepository();

	const [localPublishedDocumentIDs, newDocuments] = await Promise.all([
		fetchPublishedDocumentIDs({
			client,
			abortController,
			pluginOptions,
		}),
		fetchNewDocuments({ client, abortController }),
	]);

	if (localPublishedDocumentIDs.length) {
		state.setPublishedDocumentIDs(localPublishedDocumentIDs);
	}

	const modelsRaw = await fetch(withAssetPrefix(__PUBLIC_MODELS_PATH__), {
		signal,
	});
	const models: Record<
		string,
		{
			customTypeModels: CustomTypeModel[];
			sharedSliceModels: SharedSliceModel[];
		}
	> = await modelsRaw.json();

	const modelsForRepository = models[pluginOptions.repositoryName];

	await Promise.all([
		fetchLinkedDocuments(
			newDocuments,
			client,
			pluginOptions,
			repositoryConfig,
			modelsForRepository.customTypeModels,
			modelsForRepository.sharedSliceModels,
			abortController,
		),
		Promise.all(
			newDocuments.map(async (doc) => {
				const model = modelsForRepository.customTypeModels.find(
					(model) => model.id === doc.type,
				);

				if (model) {
					const normalizedDocument = await normalizeDocument(
						doc,
						model,
						modelsForRepository.sharedSliceModels,
						repositoryConfig,
						pluginOptions,
					);

					state.addDocument(normalizedDocument);
				}
			}),
		),
	]);

	state.setIsBootstrapped(true);
};

export default bootstrapPrismicPreview;
