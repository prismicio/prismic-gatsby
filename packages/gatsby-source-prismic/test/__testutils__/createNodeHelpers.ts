import * as gatsby from "gatsby";
import * as gatsbyNodeHelpers from "gatsby-node-helpers";
import { PartialDeep } from "type-fest";

import { PluginOptions } from "../../src";

export const createNodeHelpers = (
	gatsbyContext: PartialDeep<gatsby.NodePluginArgs>,
	pluginOptions: PluginOptions,
): gatsbyNodeHelpers.NodeHelpers =>
	gatsbyNodeHelpers.createNodeHelpers({
		typePrefix: `Prismic ${pluginOptions.typePrefix}`,
		fieldPrefix: "Prismic",
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		createNodeId: gatsbyContext.createNodeId!,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		createContentDigest: gatsbyContext.createContentDigest!,
	});
