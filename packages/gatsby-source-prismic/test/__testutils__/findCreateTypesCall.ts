import type { SpyInstance } from "vitest";

import type { GatsbyGraphQLType } from "gatsby";

export const findCreateTypesCall = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	GraphQLType extends GatsbyGraphQLType = any,
>(
	spy: SpyInstance,
	name: string,
): GraphQLType => {
	const call = spy.mock.calls.find(
		(args) =>
			typeof args[0] === "object" &&
			"kind" in args[0] &&
			args[0].config.name === name,
	);

	if (!call) {
		throw new Error(`Did not find a createTypes call for "${name}"`);
	}

	return call[0];
};
