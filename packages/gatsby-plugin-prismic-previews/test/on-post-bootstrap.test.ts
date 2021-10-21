import test from "ava";
import * as gatsby from "gatsby";
import * as sinon from "sinon";
import * as prismicM from "@prismicio/mock";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createPluginOptions } from "./__testutils__/createPluginOptions";
import { createRuntime } from "./__testutils__/createRuntime";

import { onPostBootstrap } from "../src/gatsby-node";

const noop = () => void 0;

test("saves serialized typepaths to filesystem", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const model = prismicM.model.customType();

	const runtime = createRuntime(pluginOptions);
	runtime.registerCustomTypeModels([model]);
	(gatsbyContext.getNodesByType as sinon.SinonStub).callsFake((type: string) =>
		type === "PrismicPrefixTypePathType" ? runtime.typePaths : [],
	);

	await onPostBootstrap(
		gatsbyContext as gatsby.ParentSpanPluginArgs,
		pluginOptions,
		noop,
	);

	const writeTypePathsToFilesystemCall = (
		pluginOptions.writeTypePathsToFilesystem as sinon.SinonStub
	).getCall(0).firstArg;

	t.is(
		writeTypePathsToFilesystemCall.publicPath,
		"public/static/3e66cce7662062ad5137e62e8bb62096.json",
	);

	t.deepEqual(
		JSON.parse(writeTypePathsToFilesystemCall.serializedTypePaths),
		runtime.typePaths,
	);
});

test("panics if type path nodes are not found", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	(gatsbyContext.getNodesByType as sinon.SinonStub).returns([]);

	await onPostBootstrap(
		gatsbyContext as gatsby.ParentSpanPluginArgs,
		pluginOptions,
		noop,
	);

	t.true(
		(gatsbyContext.reporter.panic as unknown as sinon.SinonStub).calledWith(
			sinon.match(/type paths for this repository could not be found/i),
		),
	);
});
