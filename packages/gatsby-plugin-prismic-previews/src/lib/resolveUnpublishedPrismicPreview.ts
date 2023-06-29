import type { NormalizedDocument, PagePropsLike } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

import { fmtLog } from "./fmtLog";
import { getRepositoryConfig } from "./getRepositoryConfig";

const resolveUnpublishedPrismicPreview = <TProps extends PagePropsLike>(
	repositoryName: string,
	abortController: AbortController,
	setUnpublishedData: React.Dispatch<
		React.SetStateAction<{
			data?: { [key: string]: NormalizedDocument };
			component?: React.ComponentType<TProps>;
		}>
	>,
	pathname?: string,
): void => {
	if (pathname) {
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

		if (repositoryConfig.componentResolver) {
			const state = usePrismicPreviewStore.getState();

			const documentsForPage = Object.values(state.documents).filter(
				(doc) => doc.url === pathname,
			);

			if (documentsForPage.length > 0) {
				const firstDocument = documentsForPage[0];

				const typename = firstDocument.__typename;
				const dataKey = typename.charAt(0).toLowerCase() + typename.slice(1);

				const componentResolver = repositoryConfig.componentResolver;

				const ResolvedComponent =
					typeof componentResolver === "function"
						? componentResolver(documentsForPage)
						: componentResolver[firstDocument.type];

				if (ResolvedComponent) {
					if (!abortController.signal.aborted) {
						setUnpublishedData({
							data: { [dataKey]: firstDocument },
							component: ResolvedComponent,
						});
					}
				} else {
					console.warn(
						fmtLog(
							repositoryName,
							`A component for this unpublished document preview was not found. The app's default 404 page will be displayed instead.\n\nIf this was unintentional, you can fix the issue by ensuring the componentResolver option for this repository in <PrismicPreviewProvider> returns a value for "${firstDocument.type}" documents.`,
						),
					);
				}
			}
		} else {
			console.warn(
				fmtLog(
					repositoryName,
					"A componentResolver object or function for this repository was not provided to <PrismicPreviewProvider>. The app's default 404 page will be displayed instead of the previewed document.\n\nYou can fix this warning by adding a componentResolver value to this repository's configuration object in <PrismicPreviewProvider>.",
				),
			);
		}
	}
};

export default resolveUnpublishedPrismicPreview;
