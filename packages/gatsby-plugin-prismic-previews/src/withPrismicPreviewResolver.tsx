import * as React from "react";

import { getActiveRepositoryName } from "./lib/getActiveRepositoryName";
import { getComponentDisplayName } from "./lib/getComponentDisplayName";

export type WithPrismicPreviewResolverProps = {
	isPrismicPreview: boolean;
};

export const withPrismicPreviewResolver = <TProps,>(
	WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps> => {
	const WithPrismicPreviewResolver = (props: TProps): JSX.Element => {
		const [isPrismicPreview, setIsPrismicPreview] = React.useState<
			boolean | null
		>(null);

		React.useEffect(() => {
			const abortController = new AbortController();

			const repositoryName = getActiveRepositoryName();
			setIsPrismicPreview(!!repositoryName);

			if (repositoryName) {
				import("./lib/resolvePrismicPreview").then((mod) =>
					mod.default(repositoryName, abortController),
				);
			}

			return () => abortController.abort();
		}, []);

		return <WrappedComponent {...props} isPrismicPreview={isPrismicPreview} />;
	};

	if (process.env.NODE_ENV === "development") {
		const wrappedComponentName = getComponentDisplayName(WrappedComponent);
		WithPrismicPreviewResolver.displayName = `withPrismicPreviewResolver(${wrappedComponentName})`;
	}

	return WithPrismicPreviewResolver;
};
