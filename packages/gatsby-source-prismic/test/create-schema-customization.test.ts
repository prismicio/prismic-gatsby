import test from "ava";
import * as sinon from "sinon";
import * as gatsby from "gatsby";
import * as prismicM from "@prismicio/mock";

import { createGatsbyContext } from "./__testutils__/createGatsbyContext";
import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";
import { createMockKitchenSinkCustomTypeModel } from "./__testutils__/createMockKitchenSinkCustomTypeModel";
import { createMockKitchenSinkSharedSliceModel } from "./__testutils__/createMockKitchenSinkSharedSliceModel";
import { createPluginOptions } from "./__testutils__/createPluginOptions";

import { createSchemaCustomization } from "../src/gatsby-node";

// Flag that determines if the test is being run in a CI environment like
// GitHub Actions. This is only used **TEMPORARILY** for tests that only fail
// in CIs.
//
// ALL TESTS MUST PASS LOCALLY
const IS_CI = process.env.CI;

const noop = () => void 0;

test("creates type path nodes", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	pluginOptions.customTypeModels = [createMockKitchenSinkCustomTypeModel(t)];
	pluginOptions.sharedSliceModels = [createMockKitchenSinkSharedSliceModel(t)];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	const calls = (gatsbyContext.actions.createNode as sinon.SinonStub)
		.getCalls()
		.map((call) => ({
			kind: call.firstArg.kind,
			type: call.firstArg.type,
			path: call.firstArg.path,
		}));

	if (!IS_CI) {
		t.snapshot(calls);
	}
});

test("field names with dashes are transformed with underscores by default", async (t) => {
	const gatsbyContext = createGatsbyContext();
	const pluginOptions = createPluginOptions(t);

	const model = createMockCustomTypeModelWithFields(t, {
		"dash-group": {
			...prismicM.model.group({ seed: t.title }),
			config: {
				label: "Group",
				fields: {
					"dash-boolean": prismicM.model.boolean({ seed: t.title }),
				},
			},
		},
		"dash-sliceZone": {
			...prismicM.model.sliceZone({ seed: t.title }),
			config: {
				labels: {},
				choices: {
					"dash-slice": {
						...prismicM.model.slice({ seed: t.title }),
						"non-repeat": {
							"dash-boolean": prismicM.model.boolean({ seed: t.title }),
						},
						repeat: {
							"dash-boolean": prismicM.model.boolean({ seed: t.title }),
						},
					},
				},
			},
		},
	});

	pluginOptions.customTypeModels = [model];

	await createSchemaCustomization(
		gatsbyContext as gatsby.CreateSchemaCustomizationArgs,
		pluginOptions,
		noop,
	);

	const calls = (gatsbyContext.actions.createNode as sinon.SinonStub)
		.getCalls()
		.map((call) => ({
			kind: call.firstArg.kind,
			type: call.firstArg.type,
			path: call.firstArg.path,
		}));

	if (!IS_CI) {
		t.snapshot(calls);
	}
});
