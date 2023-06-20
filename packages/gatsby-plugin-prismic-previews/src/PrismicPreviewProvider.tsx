import * as React from "react";

import type { RepositoryConfig } from "./types";

import { usePrismicPreviewStore } from "./usePrismicPreviewStore";

export type PrismicPreviewProviderProps = {
	repositoryConfigs: RepositoryConfig[];
	children?: React.ReactNode;
};

export const PrismicPreviewProvider = (
	props: PrismicPreviewProviderProps,
): JSX.Element => {
	const setRepositoryConfigs = usePrismicPreviewStore(
		(state) => state.setRepositoryConfigs,
	);

	React.useEffect(() => {
		setRepositoryConfigs(props.repositoryConfigs);
	}, [setRepositoryConfigs, props.repositoryConfigs]);

	return <>{props.children}</>;
};
