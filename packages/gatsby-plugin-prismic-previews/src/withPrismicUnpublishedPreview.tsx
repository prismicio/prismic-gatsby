import * as React from "react";

import { getActiveRepositoryName } from "./lib/getActiveRepositoryName";
import { getComponentDisplayName } from "./lib/getComponentDisplayName";

import type { NormalizedDocument, PagePropsLike } from "./types";

export const withPrismicUnpublishedPreview = <TProps extends PagePropsLike>(
	WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps> => {
	const WithPrismicUnpublishedPreview = (props: TProps): JSX.Element => {
		const [unpublishedData, setUnpublishedData] = React.useState<{
			data?: { [key: string]: NormalizedDocument };
			component?: React.ComponentType<TProps>;
		}>({});

		const ResolvedComponent = unpublishedData.component || WrappedComponent;

		const data = React.useMemo(
			() => ({ ...props.data, ...unpublishedData.data }),
			[props.data, unpublishedData.data],
		);

		React.useEffect(() => {
			const abortController = new AbortController();

			const repositoryName = getActiveRepositoryName();

			if (repositoryName) {
				Promise.all([
					import("./lib/bootstrapPrismicPreview"),
					import("./lib/resolveUnpublishedPrismicPreview"),
				]).then(([bootstrap, resolve]) =>
					bootstrap
						.default(repositoryName, abortController)
						.then(() =>
							resolve.default(
								repositoryName,
								abortController,
								setUnpublishedData,
								props.location?.pathname,
							),
						),
				);
			}

			return () => abortController.abort();
		}, [props.location?.pathname]);

		return <ResolvedComponent {...props} data={data} />;
	};

	if (process.env.NODE_ENV === "development") {
		const wrappedComponentName = getComponentDisplayName(WrappedComponent);
		WithPrismicUnpublishedPreview.displayName = `withPrismicUnpublishedPreview(${wrappedComponentName})`;
	}

	return WithPrismicUnpublishedPreview;
};
