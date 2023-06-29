import type { SpyInstance } from "vitest";

import * as util from "util";

import { findCreateTypesCall } from "./findCreateTypesCall";

export const debugCreateTypesCall = (spy: SpyInstance, name: string): void => {
	const type = findCreateTypesCall(spy, name);

	// eslint-disable-next-line no-console
	console.debug(util.inspect(type, { depth: null, colors: true }));
};
