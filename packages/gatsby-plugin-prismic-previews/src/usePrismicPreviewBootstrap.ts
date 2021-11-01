import * as React from "react";

import { FetchLike, PrismicRepositoryConfig } from "./types";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";

export type UsePrismicPreviewBootstrapConfig = {
	fetch?: FetchLike;
};

export const usePrismicPreviewBootstrap = (
	repositoryConfigs: PrismicRepositoryConfig[] = [],
	config: UsePrismicPreviewBootstrapConfig = {},
): (() => Promise<void>) => {
	const [contextState, contextDispatch] = usePrismicPreviewContext();

	// We will access the context state via a ref to ensure we always have
	// the latest value. This is necessary since we will be updating state
	// within the returned callback function. If a ref was not used, our
	// context state would be stale.
	const contextStateRef = React.useRef(contextState);
	React.useEffect(() => {
		contextStateRef.current = contextState;
	}, [contextState]);

	return React.useCallback(async (): Promise<void> => {
		const { prismicPreviewBootstrap } = await import("./bootstrapFn");

		return prismicPreviewBootstrap({
			contextStateRef,
			contextDispatch,
			fetch: config.fetch,
			repositoryConfigs,
		});
	}, [repositoryConfigs, config.fetch, contextDispatch]);
};
