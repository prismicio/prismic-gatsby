import * as gatsby from "gatsby";
import * as gatsbyUtils from "gatsby-plugin-utils";

import { ERROR_MAP } from "./constants";

type GatsbyNodeOnPluginInit = (
	context: { reporter: gatsby.Reporter },
	pluginOptions: gatsby.PluginOptions,
) => void;

let coreSupportsOnPluginInit: boolean;
try {
	coreSupportsOnPluginInit = gatsbyUtils.isGatsbyNodeLifecycleSupported(
		"unstable_onPluginInit",
	);
} catch (error) {
	coreSupportsOnPluginInit = false;
}

export const onPreInit: NonNullable<gatsby.GatsbyNode["onPreInit"]> = (
	gatsbyContext,
) => {
	if (!coreSupportsOnPluginInit && gatsbyContext.reporter.setErrorMap) {
		gatsbyContext.reporter.setErrorMap(ERROR_MAP);
	}
};

const unstable_onPluginInit: GatsbyNodeOnPluginInit = (gatsbyContext) => {
	gatsbyContext.reporter.setErrorMap(ERROR_MAP);
};

if (coreSupportsOnPluginInit) {
	exports.unstable_onPluginInit = unstable_onPluginInit;
}
