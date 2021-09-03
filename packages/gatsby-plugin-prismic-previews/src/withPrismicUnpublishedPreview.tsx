import * as React from "react";
import * as gatsby from "gatsby";
import * as gatsbyPrismic from "gatsby-source-prismic";

import { camelCase } from "./lib/camelCase";
import { getComponentDisplayName } from "./lib/getComponentDisplayName";

import {
	FetchLike,
	PrismicUnpublishedRepositoryConfig,
	PrismicUnpublishedRepositoryConfigs,
	UnknownRecord,
} from "./types";
import { usePrismicPreviewBootstrap } from "./usePrismicPreviewBootstrap";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";
import { PrismicContextActionType, PrismicPreviewState } from "./context";
import { PrismicPreviewUI } from "./components/PrismicPreviewUI";

/**
 * A convenience function to create a `componentResolver` function from a record
 * mapping a Prismic document type to a React component.
 *
 * In most cases, this convenience function is sufficient to provide a working
 * unpublished preview experience.
 *
 * @param componentMap - A record mapping a Prismic document type to a React component.
 *
 * @returns A `componentResolver` function that can be passed to
 *   `withPrismicUnpublishedPreview`'s configuration.
 */
export const componentResolverFromMap =
	(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		componentMap: Record<string, React.ComponentType<any>>,
	): PrismicUnpublishedRepositoryConfig["componentResolver"] =>
	(nodes) => {
		if (nodes.length > 0) {
			return componentMap[nodes[0].type] || null;
		} else {
			return null;
		}
	};

/**
 * A `dataResolver` function that assumes the first matching node for the page's
 * URL is the primary document. The document is added to the page's `data` prop
 * using the Prismic document's type formatted using Gatsby's camel-cased query
 * convention.
 */
export const defaultDataResolver: PrismicUnpublishedRepositoryConfig["dataResolver"] =
	(nodes, data) => {
		if (nodes.length > 0) {
			const key = camelCase(nodes[0].internal.type);

			return {
				...data,
				[key]: nodes[0],
			};
		} else {
			return data;
		}
	};

const useNodesForPath = (
	path: string,
): gatsbyPrismic.NormalizedDocumentValue[] => {
	const [state, setState] = React.useState(0);
	const rerender = () => setState((i) => i + 1);

	const activeRuntime = useActiveRuntime();

	React.useEffect(() => {
		if (activeRuntime) {
			activeRuntime.subscribe(rerender);
		}

		return () => {
			if (activeRuntime) {
				activeRuntime.unsubscribe(rerender);
			}
		};
	}, [activeRuntime]);

	return React.useMemo(() => {
		// To appease the exhaustive-deps linter rule
		state;

		return activeRuntime
			? activeRuntime.nodes.filter((node) => node.url === path)
			: [];
	}, [state, path, activeRuntime]);
};

const useActiveRuntime = (): gatsbyPrismic.Runtime | undefined => {
	const [contextState] = usePrismicPreviewContext();

	return React.useMemo(
		() =>
			contextState.activeRepositoryName
				? contextState.runtimeStore[contextState.activeRepositoryName]
				: undefined,
		[contextState.activeRepositoryName, contextState.runtimeStore],
	);
};

const useActiveRepositoryConfig = (
	repositoryConfigs: PrismicUnpublishedRepositoryConfigs = [],
) => {
	const [contextState] = usePrismicPreviewContext();

	return React.useMemo(
		() =>
			[...repositoryConfigs, ...contextState.repositoryConfigs].find(
				(config) => config.repositoryName === contextState.activeRepositoryName,
			),
		[
			contextState.activeRepositoryName,
			contextState.repositoryConfigs,
			repositoryConfigs,
		],
	);
};

export type WithPrismicUnpublishedPreviewConfig = {
	fetch?: FetchLike;
};

/**
 * A React higher order component (HOC) that wraps a Gatsby page to
 * automatically display a template for an unpublished Prismic document. This
 * HOC should be used on your app's 404 page (usually `src/pages/404.js`).
 *
 * @param WrappedComponent - The Gatsby page component.
 * @param usePrismicPreviewBootstrapConfig - Configuration determining how the
 *   preview session is managed.
 * @param config - Configuration determining how the HOC handes previewed content.
 *
 * @returns `WrappedComponent` with automatic unpublished Prismic preview data.
 */
export const withPrismicUnpublishedPreview = <
	TStaticData extends UnknownRecord,
	TProps extends gatsby.PageProps<TStaticData>,
>(
	WrappedComponent: React.ComponentType<TProps>,
	repositoryConfigs?: PrismicUnpublishedRepositoryConfigs,
	config: WithPrismicUnpublishedPreviewConfig = {},
): React.ComponentType<TProps> => {
	const WithPrismicUnpublishedPreview = (props: TProps): React.ReactElement => {
		const [contextState, contextDispatch] = usePrismicPreviewContext();
		const bootstrapPreview = usePrismicPreviewBootstrap(repositoryConfigs, {
			fetch: config.fetch,
		});
		const nodesForPath = useNodesForPath(props.location.pathname);
		const repositoryConfig = useActiveRepositoryConfig(repositoryConfigs);

		const ResolvedComponent = React.useMemo(
			() =>
				repositoryConfig?.componentResolver(nodesForPath) ?? WrappedComponent,
			[repositoryConfig, nodesForPath],
		);

		const resolvedData = React.useMemo(() => {
			const dataResolver =
				repositoryConfig?.dataResolver || defaultDataResolver;

			return dataResolver(nodesForPath, props.data);
		}, [repositoryConfig?.dataResolver, nodesForPath, props.data]);

		const afterAccessTokenSet = React.useCallback(() => {
			contextDispatch({ type: PrismicContextActionType.GoToIdle });
			bootstrapPreview();
		}, [bootstrapPreview, contextDispatch]);

		React.useEffect(() => {
			bootstrapPreview();
		}, [bootstrapPreview]);

		return contextState.previewState === PrismicPreviewState.ACTIVE ? (
			<ResolvedComponent {...props} data={resolvedData} />
		) : (
			<>
				<WrappedComponent {...props} />
				<PrismicPreviewUI afterAccessTokenSet={afterAccessTokenSet} />
			</>
		);
	};

	const wrappedComponentName = getComponentDisplayName(WrappedComponent);
	WithPrismicUnpublishedPreview.displayName = `withPrismicUnpublishedPreview(${wrappedComponentName})`;

	return WithPrismicUnpublishedPreview;
};
