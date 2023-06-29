// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";

import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { withAssetPrefix } from "gatsby";

import { renderPage } from "./__testutils__/renderPage";
import { setupPreviewEnv } from "./__testutils__/setupPreviewEnv";

import {
	WithPrismicPreviewProps,
	withPrismicPreview,
	withPrismicUnpublishedPreview,
} from "../src";
import type { PagePropsLike } from "../src/types";

vi.mock("gatsby", () => {
	return {
		withAssetPrefix: vi.fn((path: string) => path),
	};
});

afterEach(() => {
	vi.mocked(withAssetPrefix).mockClear();
});

const PageTemplate = withPrismicPreview(
	(props: Partial<PagePropsLike & WithPrismicPreviewProps>) => {
		return (
			<div data-testid="page">
				<div data-testid="isPrismicPreview">
					{String(props.isPrismicPreview)}
				</div>
				<div data-testid="data">{JSON.stringify(props.data)}</div>
				<div data-testid="originalData">
					{JSON.stringify(props.originalData)}
				</div>
			</div>
		);
	},
);

const Page = withPrismicUnpublishedPreview((props: Partial<PagePropsLike>) => {
	return (
		<div data-testid="unpublished-page">
			<div data-testid="data">{JSON.stringify(props.data)}</div>
		</div>
	);
});

const waitForDataChange = async () => {
	await waitFor(() => {
		expect(screen.getByTestId("page")).toBeDefined();
	});

	const propData = JSON.parse(screen.getByTestId("data").textContent ?? "null");

	return { propData };
};

test("renders the wrapped component", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});
	renderPage({ Page, repositoryConfigs });

	expect(screen.getByTestId("unpublished-page")).toBeDefined();
});

test("fetches preview data and renders resolved component with data", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];
	const data = { foo: "bar" };

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		customTypeModels,
		repositoryConfig: { componentResolver: { [docs[0].type]: PageTemplate } },
	});
	renderPage({ Page, data, repositoryConfigs });
	const { propData } = await waitForDataChange();

	expect(propData.foo).toBe("bar");

	expect(propData.prismicFoo.prismicId).toBe(docs[0].id);
	expect(propData.prismicFoo.__typename).toBe("PrismicFoo");
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

		test("labels the wrapped component with withPrismicUnpublishedPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicUnpublishedPreview(Component).displayName).toBe(
				`withPrismicUnpublishedPreview(${Component.displayName})`,
			);
		});
	});

	describe("production", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "production";
		});

		test("does not label the wrapped component with withPrismicUnpublishedPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicUnpublishedPreview(Component).displayName).toBe(
				undefined,
			);
		});
	});

	describe("test", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "test";
		});

		test("does not label the wrapped component with withPrismicUnpublishedPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicUnpublishedPreview(Component).displayName).toBe(
				undefined,
			);
		});
	});
});
