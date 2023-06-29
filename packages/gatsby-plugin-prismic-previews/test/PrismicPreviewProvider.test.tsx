// @vitest-environment happy-dom
import { expect, test } from "vitest";

import * as React from "react";
import { render, screen } from "@testing-library/react";

import { PrismicPreviewProvider, RepositoryConfig } from "../src";
import { usePrismicPreviewStore } from "../src/usePrismicPreviewStore";

test("sets given repository configs to the repositoryConfigs store", () => {
	const repositoryConfigs: RepositoryConfig[] = [{ repositoryName: "foo" }];

	render(
		<PrismicPreviewProvider repositoryConfigs={repositoryConfigs}>
			<span>children</span>
		</PrismicPreviewProvider>,
	);

	const state = usePrismicPreviewStore.getState();

	expect(state.repositoryConfigs).toStrictEqual(repositoryConfigs);
});

test("passes children through", () => {
	render(
		<PrismicPreviewProvider repositoryConfigs={[]}>
			<span>children</span>
		</PrismicPreviewProvider>,
	);

	expect(screen.getByText("children")).toBeDefined();
});
