import * as React from "react";
import * as gatsby from "gatsby";

import { getComponentDisplayName } from "./lib/getComponentDisplayName";

import { FetchLike, PrismicRepositoryConfigs } from "./types";
import { usePrismicPreviewResolver } from "./usePrismicPreviewResolver";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";

import { StateKind } from "./context";
import { PrismicPreviewUI } from "./components/PrismicPreviewUI";

export interface WithPrismicPreviewResolverProps {
	isPrismicPreview: boolean | null;
	prismicPreviewPath: string | undefined;
}

export type WithPrismicPreviewResolverConfig = {
	autoRedirect?: boolean;
	navigate?: typeof gatsby.navigate;
	fetch?: FetchLike;
};

/**
 * A React higher order component (HOC) that wraps a Gatsby page to
 * automatically setup a Prismic preview resolver page. It can automatically
 * redirect an editor to the previewed document's page.
 *
 * @param WrappedComponent - The Gatsby page component.
 * @param usePrismicPreviewResolverConfig - Configuration determining how the
 *   preview session is resolved.
 * @param config - Configuration determining how the HOC handes the resolved preview.
 *
 * @returns `WrappedComponent` with automatic Prismic preview resolving.
 */
export const withPrismicPreviewResolver = <TProps extends gatsby.PageProps>(
	WrappedComponent: React.ComponentType<
		TProps & WithPrismicPreviewResolverProps
	>,
	repositoryConfigs: PrismicRepositoryConfigs = [],
	config: WithPrismicPreviewResolverConfig = {},
): React.ComponentType<TProps> => {
	const WithPrismicPreviewResolver = (props: TProps): React.ReactElement => {
		const [contextState] = usePrismicPreviewContext();
		const { resolvePreview, uncheckedResolvePreview } =
			usePrismicPreviewResolver(repositoryConfigs, {
				fetch: config.fetch,
			});

		const isPreview =
			contextState.state === StateKind.Init
				? null
				: contextState.state !== StateKind.NotPreview;

		const afterAccessTokenSet = React.useCallback(() => {
			uncheckedResolvePreview();
		}, [uncheckedResolvePreview]);

		React.useEffect(() => {
			resolvePreview();
		}, [resolvePreview]);

		React.useEffect(() => {
			if (
				contextState.state === StateKind.Resolved &&
				contextState.stateContext.resolvedURL &&
				(config.autoRedirect ?? true)
			) {
				const navigate = config.navigate || gatsby.navigate;

				navigate(contextState.stateContext.resolvedURL);
			}
		}, [contextState.state, contextState.stateContext]);

		return (
			<>
				<WrappedComponent
					{...props}
					isPrismicPreview={isPreview}
					prismicPreviewPath={
						contextState.state === StateKind.Resolved
							? contextState.stateContext.resolvedURL
							: undefined
					}
				/>
				<PrismicPreviewUI afterAccessTokenSet={afterAccessTokenSet} />
			</>
		);
	};

	const wrappedComponentName = getComponentDisplayName(WrappedComponent);
	WithPrismicPreviewResolver.displayName = `withPrismicPreviewResolver(${wrappedComponentName})`;

	return WithPrismicPreviewResolver;
};
