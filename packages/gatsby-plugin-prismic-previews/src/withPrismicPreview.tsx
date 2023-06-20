import * as React from "react";

import { getActiveRepositoryName } from "./lib/getActiveRepositoryName";
import { getComponentDisplayName } from "./lib/getComponentDisplayName";

import type { PagePropsLike } from "./types";

import { useMergePrismicPreviewData } from "./useMergePrismicPreviewData";
import { usePrismicPreviewStore } from "./usePrismicPreviewStore";

export type WithPrismicPreviewProps<TProps = Record<string, unknown>> = {
	originalData: TProps;
	isPrismicPreview: boolean;
};

export const withPrismicPreview = <TProps extends PagePropsLike>(
	WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps> => {
	const WithPrismicPreview = (props: TProps): JSX.Element => {
		const isBootstrapped = usePrismicPreviewStore(
			(state) => state.isBootstrapped,
		);

		const [isPrismicPreview, setIsPrismicPreview] = React.useState<
			boolean | null
		>(null);
		const mergedData = useMergePrismicPreviewData(props.data);

		React.useEffect(() => {
			const abortController = new AbortController();

			if (!isBootstrapped) {
				const repositoryName = getActiveRepositoryName();
				setIsPrismicPreview(!!repositoryName);

				if (repositoryName) {
					import("./lib/bootstrapPrismicPreview").then((mod) =>
						mod.default(repositoryName, abortController),
					);
				}
			}

			return () => abortController.abort();
		}, [isBootstrapped]);

		return (
			<WrappedComponent
				{...props}
				data={mergedData}
				originalData={props.data}
				isPrismicPreview={isPrismicPreview}
			/>
		);
	};

	if (process.env.NODE_ENV === "development") {
		const wrappedComponentName = getComponentDisplayName(WrappedComponent);
		WithPrismicPreview.displayName = `withPrismicPreview(${wrappedComponentName})`;
	}

	return WithPrismicPreview;
};
