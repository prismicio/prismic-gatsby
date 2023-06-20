import { expect, test, vi } from "vitest";

import { getToolbarSrc } from "@prismicio/client";

import { buildPluginOptions } from "../__testutils__/buildPluginOptions";
import { createRenderBodyArgs } from "../__testutils__/createRenderBodyArgs";

import { onRenderBody } from "../../src/gatsby-ssr";

test("adds Prismic toolbar to head", () => {
	const renderBodyArgs = createRenderBodyArgs();
	const pluginOptions = buildPluginOptions();

	renderBodyArgs.setHeadComponents = vi.fn();
	renderBodyArgs.setPostBodyComponents = vi.fn();

	onRenderBody(renderBodyArgs, pluginOptions);

	expect(renderBodyArgs.setPostBodyComponents).toHaveBeenCalledWith([
		<script
			key={`prismic-toolbar-${pluginOptions.repositoryName}`}
			defer={true}
			src={getToolbarSrc(pluginOptions.repositoryName)}
		/>,
	]);
});

test("adds preconnect and ds-prefetch link components in head", () => {
	const renderBodyArgs = createRenderBodyArgs();
	const pluginOptions = buildPluginOptions();

	renderBodyArgs.setHeadComponents = vi.fn();
	renderBodyArgs.setPostBodyComponents = vi.fn();

	onRenderBody(renderBodyArgs, pluginOptions);

	expect(renderBodyArgs.setHeadComponents).toHaveBeenCalledWith([
		<link
			key="preconnect-prismic-toolbar"
			href="https://static.cdn.prismic.io"
			rel="preconnect"
		/>,
		<link
			key="dns-prefetch-prismic-toolbar"
			href="https://static.cdn.prismic.io"
			rel="dns-prefetch"
		/>,
	]);
});
