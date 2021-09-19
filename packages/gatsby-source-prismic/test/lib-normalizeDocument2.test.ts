import test from "ava";
import * as gatsby from "gatsby";
import * as prismicM from "@prismicio/mock";
import * as util from "util";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { normalizeDocument } from "../src/lib/normalizeDocument2";

test("normalizes a document", async (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const value = prismicM.value.document({ seed: t.title, model });
	const gatsbyContext = createGatsbyContext() as gatsby.NodePluginArgs;
	const pluginOptions = createPluginOptions(t);

	const actual = await normalizeDocument({
		model,
		value,
		gatsbyContext,
		pluginOptions,
		createRemoteFileNode: pluginOptions.createRemoteFileNode!,
	});

	t.log(util.inspect(actual, { depth: null, colors: true }));
});
