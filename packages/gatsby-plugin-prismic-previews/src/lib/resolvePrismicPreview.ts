import { navigate } from "gatsby";

import { fmtLog } from "./fmtLog";
import { getClient } from "./getClient";
import { getPluginOptions } from "./getPluginOptions";
import { getRepositoryConfig } from "./getRepositoryConfig";

const resolvePrismicPreview = async (
	repositoryName: string,
	abortController: AbortController,
): Promise<void> => {
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

	try {
		const path = await client.resolvePreviewURL({
			linkResolver: repositoryConfig.linkResolver,
			defaultURL: "/",
			signal: abortController.signal,
		});

		if (!abortController.signal.aborted) {
			navigate(path);
		}
	} catch (error) {
		if (!(error instanceof Error && error.name === "AbortError")) {
			throw error;
		}
	}
};

export default resolvePrismicPreview;
