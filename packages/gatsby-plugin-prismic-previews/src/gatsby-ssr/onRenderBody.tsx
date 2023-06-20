import * as React from "react";
import { getToolbarSrc } from "@prismicio/client";
import type { RenderBodyArgs } from "gatsby";

import type { PluginOptions } from "../types";

export const onRenderBody = (
	args: RenderBodyArgs,
	options: PluginOptions,
): void => {
	const toolbarURL = new URL(getToolbarSrc(options.repositoryName));

	args.setHeadComponents([
		<link
			rel="preconnect"
			key="preconnect-prismic-toolbar"
			href={toolbarURL.origin}
		/>,
		<link
			rel="dns-prefetch"
			key="dns-prefetch-prismic-toolbar"
			href={toolbarURL.origin}
		/>,
	]);

	// TODO: Maybe utilize the new Script component if the Gatsby version
	// supports it.
	args.setPostBodyComponents([
		<script
			src={toolbarURL.href}
			defer={true}
			key={`prismic-toolbar-${options.repositoryName}`}
		/>,
	]);
};
