import * as gatsby from "gatsby";
import * as gatsbyNodeHelpers from "gatsby-node-helpers";
import { PartialDeep } from "type-fest";

import { UnpreparedPluginOptions } from "../../src";

export const createNodeHelpers = (
	gatsbyContext: PartialDeep<gatsby.NodePluginArgs>,
	pluginOptions: UnpreparedPluginOptions,
): gatsbyNodeHelpers.NodeHelpers =>
	gatsbyNodeHelpers.createNodeHelpers({
		typePrefix: `Prismic ${pluginOptions.typePrefix}`,
		fieldPrefix: "Prismic",
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		createNodeId: gatsbyContext.createNodeId!,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		createContentDigest: gatsbyContext.createContentDigest!,
	});
