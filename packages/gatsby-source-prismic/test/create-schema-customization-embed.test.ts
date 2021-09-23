import test from "ava";
import * as sinon from "sinon";
import * as gatsby from "gatsby";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { createSchemaCustomization } from "../src/gatsby-node";

const noop = () => void 0;

test("creates base type", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	t.true(
		(gatsbyContext.actions.createTypes as sinon.SinonStub).calledWith({
			kind: "OBJECT",
			config: sinon.match({
				name: "PrismicPrefixEmbedType",
				interfaces: ["Node"],
				extensions: { infer: true },
			}),
		}),
	);
});
