// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";

import * as prismic from "@prismicio/client";
import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { navigate } from "gatsby";

import { buildPluginOptions } from "./__testutils__/buildPluginOptions";
import { buildPreviewRef } from "./__testutils__/buildPreviewRef";
import { renderPage } from "./__testutils__/renderPage";
import { setupPreviewEnv } from "./__testutils__/setupPreviewEnv";
import { waitForConsoleError } from "./__testutils__/waitForConsoleError";

import {
	WithPrismicPreviewResolverProps,
	withPrismicPreviewResolver,
} from "../src";

vi.mock("gatsby", () => {
	return {
		navigate: vi.fn(),
	};
});

beforeAll(() => {
	vi.spyOn(console, "error").mockImplementation(() => {
		// noop
	});
});

afterEach(() => {
	vi.mocked(navigate).mockClear();
	vi.mocked(console.error).mockClear();
});

const Page = withPrismicPreviewResolver(
	(props: Partial<WithPrismicPreviewResolverProps>) => {
		return (
			<div data-testid="page">
				<div data-testid="isPrismicPreview">
					{String(props.isPrismicPreview)}
				</div>
			</div>
		);
	},
);

const waitForNavigate = async () => {
	await waitFor(() => {
		expect(navigate).toHaveBeenCalled();
	});
};

test("renders the wrapped component", () => {
	render(<Page />);

	expect(screen.getByTestId("page")).toBeDefined();
});

test("redirects to the previewed document's URL", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		previewType: "resolver",
	});
	renderPage({ repositoryConfigs, Page });
	await waitForNavigate();

	expect(navigate).toHaveBeenCalledWith(`/${docs[0].uid}`);
});

test("uses the repository's Link Resolver to resolve URL", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		previewType: "resolver",
		repositoryConfig: { linkResolver: () => "/hard-coded-link-resolver" },
	});
	renderPage({ repositoryConfigs, Page });
	await waitForNavigate();

	expect(navigate).toHaveBeenCalledWith(`/hard-coded-link-resolver`);
});

test("defaults isPrismicPreview prop to null", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});
	renderPage({ Page, repositoryConfigs, static: true });

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("null");
});

test("sets isPrismicPreview prop to false if a preview is not active", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});
	renderPage({ Page, repositoryConfigs });

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("false");
});

test("sets isPrismicPreview prop to true if a preview is active", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		previewType: "resolver",
	});
	renderPage({ repositoryConfigs, Page });
	await waitForNavigate();

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("true");
});

test("does not redirect if the component unmounted", (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		previewType: "resolver",
	});
	const { unmount } = renderPage({ repositoryConfigs, Page });
	unmount();

	expect(navigate).not.toHaveBeenCalled();
});

test("logs error if plugin options for the repository could not be found", async () => {
	const pluginOptions = buildPluginOptions();
	const ref = buildPreviewRef({ repositoryName: pluginOptions.repositoryName });

	document.cookie = `${prismic.cookie.preview}=${ref};path=/`;

	renderPage({ repositoryConfigs: [], Page });

	await waitForConsoleError();

	expect(console.error).toHaveBeenCalledWith(
		expect.stringMatching(/plugin options could not be found/i),
	);
	expect(navigate).not.toHaveBeenCalled();
});

test("logs error if repository configuration for the repository could not be found", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	setupPreviewEnv({ ctx, docs, previewType: "resolver" });
	renderPage({ repositoryConfigs: [], Page });

	await waitForConsoleError();

	expect(console.error).toHaveBeenCalledWith(
		expect.stringMatching(/repository configuration could not be found/i),
	);
	expect(navigate).not.toHaveBeenCalled();
});

describe("environment-specific", () => {
	const originalNodeEnv = process.env.NODE_ENV;

	afterAll(() => {
		process.env.NODE_ENV = originalNodeEnv;
	});

	describe("development", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "development";
		});

		test("labels the wrapped component with withPrismicPreviewResolver", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreviewResolver(Component).displayName).toBe(
				`withPrismicPreviewResolver(${Component.displayName})`,
			);
		});
	});

	describe("production", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "production";
		});

		test("does not label the wrapped component with withPrismicPreviewResolver", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreviewResolver(Component).displayName).toBe(undefined);
		});
	});

	describe("test", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "test";
		});

		test("does not label the wrapped component with withPrismicPreviewResolver", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreviewResolver(Component).displayName).toBe(undefined);
		});
	});
});
