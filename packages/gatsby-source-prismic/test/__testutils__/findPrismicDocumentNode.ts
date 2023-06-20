import type { SpyInstance } from "vitest";

import type { Actions } from "gatsby";

import type { PrismicDocumentNodeInput } from "../../src/types";

export const findPrismicDocumentNode = (
	spy: SpyInstance<
		Parameters<Actions["createNode"]>,
		ReturnType<Actions["createNode"]>
	>,
	prismicId: string,
): PrismicDocumentNodeInput => {
	const call = spy.mock.calls.find((args) => args[0].prismicId === prismicId);

	if (!call) {
		throw new Error(`Did not find a createNode call for "${prismicId}"`);
	}

	return call[0] as PrismicDocumentNodeInput;
};
