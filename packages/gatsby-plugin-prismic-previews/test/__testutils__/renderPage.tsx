import * as React from "react";
import { render } from "@testing-library/react";

import { renderStatic } from "./renderStatic";

import { PrismicPreviewProvider, RepositoryConfig } from "../../src";

export type RenderPageArgs<TStatic extends boolean> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Page: React.ComponentType<any>;
	repositoryConfigs: RepositoryConfig[];
	data?: Record<string, unknown>;
	static?: TStatic;
};

export const renderPage = <TStatic extends boolean = false>(
	args: RenderPageArgs<TStatic>,
): ReturnType<typeof render> => {
	const Page = args.Page;

	const renderFn = args.static ? renderStatic : render;

	return renderFn(
		<PrismicPreviewProvider repositoryConfigs={args.repositoryConfigs}>
			<Page data={args.data} location={window.location} />
		</PrismicPreviewProvider>,
	);
};
