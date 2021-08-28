import test from "ava";
import * as assert from "assert";
import * as mswNode from "msw/node";
import * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";
import * as cookie from "es-cookie";
import * as gatsby from "gatsby";
import * as React from "react";
import * as tlr from "@testing-library/react";
import * as cc from "camel-case";
import globalJsdom from "global-jsdom";

import { clearAllCookies } from "./__testutils__/clearAllCookies";
import { createAPIQueryMockedRequest } from "./__testutils__/createAPIQueryMockedRequest";
import { createAPIRepositoryMockedRequest } from "./__testutils__/createAPIRepositoryMockedRequest";
import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPageProps } from "./__testutils__/createPageProps";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createPreviewRef } from "./__testutils__/createPreviewRef";
import { createPreviewURL } from "./__testutils__/createPreviewURL";
import { createRuntime } from "./__testutils__/createRuntime";
import { createTypePathsMockedRequest } from "./__testutils__/createTypePathsMockedRequest";
import { jsonFilter } from "./__testutils__/jsonFilter";
import { polyfillKy } from "./__testutils__/polyfillKy";

import {
	PluginOptions,
	PrismicPreviewProvider,
	PrismicRepositoryConfigs,
	PrismicUnpublishedRepositoryConfigs,
	UnknownRecord,
	WithPrismicPreviewProps,
	componentResolverFromMap,
	withPrismicPreview,
	withPrismicUnpublishedPreview,
} from "../src";
import { onClientEntry } from "../src/on-client-entry";

const server = mswNode.setupServer();
test.before(() => {
	polyfillKy();
	globalJsdom(undefined, {
		url: "https://example.com",
		pretendToBeVisual: true,
	});
	server.listen({ onUnhandledRequest: "error" });
	globalThis.__PATH_PREFIX__ = "https://example.com";
});
test.beforeEach(() => {
	clearAllCookies();
	window.history.replaceState(null, "", createPreviewURL());
});
test.afterEach(() => tlr.cleanup());
test.after(() => {
	server.close();
});

const createRepositoryConfigs = (
	pluginOptions: PluginOptions,
): PrismicUnpublishedRepositoryConfigs => {
	const baseConfigs: PrismicRepositoryConfigs = [
		{
			repositoryName: pluginOptions.repositoryName,
			linkResolver: (doc): string => `/${doc.uid}`,
		},
	];

	return baseConfigs.map((config) => ({
		...config,
		componentResolver: componentResolverFromMap({
			type: withPrismicPreview(Page, baseConfigs),
		}),
	}));
};

const NotFoundPage = <TProps extends UnknownRecord = UnknownRecord>(
	props: gatsby.PageProps<TProps>,
) => (
	<div>
		<div data-testid="component-name">NotFoundPage</div>
		<div data-testid="data">{JSON.stringify(props.data)}</div>
	</div>
);

const Page = <TProps extends UnknownRecord = UnknownRecord>(
	props: gatsby.PageProps<TProps> & WithPrismicPreviewProps<TProps>,
) => (
	<div>
		<div data-testid="component-name">Page</div>
		<div data-testid="isPrismicPreview">
			{props.isPrismicPreview === null
				? "null"
				: props.isPrismicPreview.toString()}
		</div>
		<div data-testid="prismicPreviewOriginalData">
			{JSON.stringify(props.prismicPreviewOriginalData)}
		</div>
		<div data-testid="data">{JSON.stringify(props.data)}</div>
	</div>
);

const createTree = (
	pageProps: gatsby.PageProps,
	repositoryConfigs: PrismicUnpublishedRepositoryConfigs,
) => {
	const WrappedPage = withPrismicUnpublishedPreview(
		NotFoundPage,
		repositoryConfigs,
	);

	return (
		<PrismicPreviewProvider>
			{/*
       // @ts-expect-error - Partial pageResources provided */}
			<WrappedPage {...pageProps} />
		</PrismicPreviewProvider>
	);
};

test.serial("renders the 404 page if not a preview", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const repositoryConfigs = createRepositoryConfigs(pluginOptions);

	const model = prismicM.model.customType();
	const documents = Array(20)
		.fill(undefined)
		.map(() => prismicM.value.document({ model }));

	const runtime = createRuntime(pluginOptions, repositoryConfigs[0]);
	runtime.registerCustomTypeModels([model]);
	runtime.registerDocuments(documents);

	// Need to use the query results nodes rather than new documents to ensure
	// the IDs match.
	const staticData = jsonFilter({
		previewable: runtime.nodes[0],
		nonPreviewable: runtime.nodes[1],
	});
	staticData.previewable._previewable = runtime.nodes[0].prismicId;
	// Marking this data as "old" and should be replaced during the merge.
	staticData.previewable.uid = "old";

	const pageProps = createPageProps(staticData);
	const tree = createTree(pageProps, repositoryConfigs);

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const result = tlr.render(tree);

	// Because a preview ref was not set, preview data was not fetched. The
	// component should render the base 404 component and data.
	t.true(result.getByTestId("component-name").textContent === "NotFoundPage");
	t.true(
		result.getByTestId("data").textContent === JSON.stringify(pageProps.data),
	);
});

test.serial("merges data if preview data is available", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);
	const repositoryConfigs = createRepositoryConfigs(pluginOptions);

	const ref = createPreviewRef(pluginOptions.repositoryName);
	cookie.set(prismic.cookie.preview, ref);

	const model = prismicM.model.customType({ withUID: true });
	model.id = "type";

	const documents = Array(20)
		.fill(undefined)
		.map(() => prismicM.value.document({ model, withURL: false }));
	const queryResponse = prismicM.api.query({ documents });
	const repositoryResponse = prismicM.api.repository({ seed: t.title });

	const runtime = createRuntime(pluginOptions, repositoryConfigs[0]);
	runtime.registerCustomTypeModels([model]);
	runtime.registerDocuments(documents);

	// We'll use the first node as an unpublished preview. The unpublished HOC
	// should see this URL and find the node with a matching URL.
	window.history.replaceState(null, "", runtime.nodes[0].url);

	server.use(
		createAPIRepositoryMockedRequest({ pluginOptions, repositoryResponse }),
		createAPIQueryMockedRequest({
			pluginOptions,
			repositoryResponse,
			queryResponse,
			searchParams: { ref },
		}),
		createTypePathsMockedRequest(
			"a9101d270279c16322571b8448d7a329.json",
			runtime.typePaths,
		),
	);

	// Need to use the query results nodes rather than new documents to ensure
	// the IDs match.
	const staticData = jsonFilter({
		previewable: runtime.nodes[0],
		nonPreviewable: runtime.nodes[1],
	});
	staticData.previewable._previewable = runtime.nodes[0].prismicId;
	// Marking this data as "old" and should be replaced during the merge.
	staticData.previewable.uid = "old";

	const pageProps = createPageProps(staticData);
	const tree = createTree(pageProps, repositoryConfigs);

	// @ts-expect-error - Partial gatsbyContext provided
	await onClientEntry(gatsbyContext, pluginOptions);
	const result = tlr.render(tree);

	await tlr.waitFor(() =>
		assert.ok(result.getByTestId("component-name").textContent === "Page"),
	);

	const propData = JSON.parse(result.getByTestId("data").textContent ?? "{}");
	const mergedData = jsonFilter({
		...staticData,
		previewable: runtime.nodes[0],
		[cc.camelCase(runtime.nodes[0].__typename, {
			transform: cc.camelCaseTransformMerge,
		})]: runtime.nodes[0],
	});
	t.deepEqual(propData, mergedData);
});

test("componentResolverFromMap returns componentResolver", (t) => {
	const pluginOptions = createPluginOptions(t);
	const config = createRepositoryConfigs(pluginOptions);

	const fooModel = prismicM.model.customType();
	const fooDocument = prismicM.value.document({ model: fooModel });
	const FooComp = () => <div />;

	const barModel = prismicM.model.customType();
	const barDocument = prismicM.value.document({ model: barModel });
	const BarComp = () => <div />;

	const runtime = createRuntime(pluginOptions, config[0]);
	runtime.registerCustomTypeModels([fooModel, barModel]);
	runtime.registerDocuments([fooDocument, barDocument]);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const fooNode = runtime.getNode(fooDocument.id)!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const barNode = runtime.getNode(barDocument.id)!;

	const componentResolver = componentResolverFromMap({
		[fooDocument.type]: FooComp,
		[barDocument.type]: BarComp,
	});

	t.true(componentResolver([fooNode]) === FooComp);
	t.true(componentResolver([barNode]) === BarComp);

	// It should use the first node to resolve the component.
	t.true(componentResolver([fooNode, barNode]) === FooComp);
	t.true(componentResolver([barNode, fooNode]) === BarComp);
});
