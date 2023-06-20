import { expect } from "vitest";

import * as crypto from "crypto";

import type { PluginOptions } from "../../src";
import type { PluginOptions as ValidatedPluginOptions } from "../../src/types";

export const getRepositoryNameForTest = (): string => {
	const testState = expect.getState();

	if (!testState.testPath || !testState.currentTestName) {
		throw new Error(
			"getRepositoryNameForTest can only be called in an active test.",
		);
	}

	const testID = `${testState.testPath} ${testState.currentTestName}`;

	return crypto.createHash("md5").update(testID).digest("hex");
};

export const buildPluginOptions = (
	pluginOptions?: Omit<PluginOptions, "repositoryName">,
): ValidatedPluginOptions => {
	return {
		repositoryName: getRepositoryNameForTest(),
		plugins: [],
		...pluginOptions,
	} as ValidatedPluginOptions;
};
