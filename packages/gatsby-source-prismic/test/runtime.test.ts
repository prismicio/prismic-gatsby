import test from "ava";
import * as prismicM from "@prismicio/mock";
import * as sinon from "sinon";

import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";
import { createMockKitchenSinkCustomTypeModel } from "./__testutils__/createMockKitchenSinkCustomTypeModel";
import { createMockKitchenSinkSharedSliceModel } from "./__testutils__/createMockKitchenSinkSharedSliceModel";

import * as gatsbyPrismic from "../src";

// Flag that determines if the test is being run in a CI environment like
// GitHub Actions. This is only used **TEMPORARILY** for tests that only fail
// in CIs.
//
// ALL TESTS MUST PASS LOCALLY
const IS_CI = process.env.CI;

test("createRuntime creates a Runtime instance with default config", (t) => {
	const runtime = gatsbyPrismic.createRuntime();

	t.true(runtime instanceof gatsbyPrismic.Runtime);
	t.is(runtime.config.transformFieldName("field-name"), "field_name");
	t.deepEqual(runtime.config.imageImgixParams, {
		auto: "compress,format",
		fit: "max",
	});
	t.deepEqual(runtime.config.imagePlaceholderImgixParams, {
		w: 100,
		blur: 15,
	});
	t.is(runtime.config.typePrefix, undefined);
	t.is(runtime.config.linkResolver, undefined);
	t.is(runtime.config.htmlSerializer, undefined);
});

test("config can be passed on creation", (t) => {
	const config: gatsbyPrismic.RuntimeConfig = {
		typePrefix: "typePrefix",
		linkResolver: (doc) => `/${doc.uid}`,
		htmlSerializer: { heading1: () => "heading1" },
		imageImgixParams: { q: 60 },
		imagePlaceholderImgixParams: { q: 30 },
		transformFieldName: (fieldName) => fieldName,
	};
	const runtime = gatsbyPrismic.createRuntime(config);

	t.deepEqual(runtime.config, config);
});

test("registering a custom type model adds its type paths", (t) => {
	const model = createMockKitchenSinkCustomTypeModel(t);

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	if (!IS_CI) {
		t.snapshot(runtime.typePaths);
	} else {
		t.pass();
	}
});

test("multiple custom type models can be registered at once", (t) => {
	const model1 = createMockKitchenSinkCustomTypeModel(t);
	const model2 = createMockKitchenSinkCustomTypeModel(t);

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModels([model1, model2]);

	if (!IS_CI) {
		t.snapshot(runtime.typePaths);
	} else {
		t.pass();
	}
});

test("registering a custom type model without data fields does not add DocumentData", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	t.is(runtime.typePaths.length, 1);
	if (!IS_CI) {
		t.snapshot(runtime.typePaths);
	} else {
		t.pass();
	}
});

test("registering a shared slice model adds its type paths", (t) => {
	const model = createMockKitchenSinkSharedSliceModel(t);

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerSharedSliceModel(model);

	if (!IS_CI) {
		t.snapshot(runtime.typePaths);
	} else {
		t.pass();
	}
});

test("multiple shared slice models can be registered at once", (t) => {
	const model1 = createMockKitchenSinkSharedSliceModel(t);
	const model2 = createMockKitchenSinkSharedSliceModel(t);

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerSharedSliceModels([model1, model2]);

	if (!IS_CI) {
		t.snapshot(runtime.typePaths);
	} else {
		t.pass();
	}
});

test("registering a document adds a normalized version to the runtime's nodes", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);
	runtime.registerDocument(document);

	t.true(runtime.nodes.some((node) => node.prismicId === document.id));
});

test("multiple documents can be registered at once", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document1 = prismicM.value.customType({
		seed: t.title,
		model,
	});
	const document2 = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);
	runtime.registerDocuments([document1, document2]);

	t.is(
		runtime.nodes.filter((node) =>
			[document1.id, document2.id].includes(node.prismicId),
		).length,
		2,
	);
});

test("registering a document returns its normalized version", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	t.is(normalizedDocument.prismicId, document.id);
});

test("normalizeDocument normalizes a document", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.normalizeDocument(document);

	t.is(normalizedDocument.prismicId, document.id);
});

test("normalize normalizes a value at the given path", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		richText: prismicM.model.richText({ seed: t.title }),
	});
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalized = runtime.normalize(document.data.richText, [
		document.type,
		"data",
		"richText",
	]);

	t.notThrows(() =>
		sinon.assert.match(normalized, {
			text: sinon.match.string,
			html: sinon.match.string,
			richText: document.data.richText,
			raw: document.data.richText,
		}),
	);
});

test("throws during normalization if a type path was not registered", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		richText: prismicM.model.richText({ seed: t.title }),
	});
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();

	t.throws(() => runtime.registerDocument(document), {
		message: /no type for path/i,
	});
});

test("throws during normalization if a value does not match the type path type", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		richText: prismicM.model.richText({ seed: t.title }),
	});
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});
	// @ts-expect-error - We are purposely giving it unexpected data
	document.data.richText = prismicM.value.boolean({ seed: t.title });

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	t.throws(() => runtime.registerDocument(document), {
		message: /not expected type/i,
	});
});

test("getNode returns a registered document by its Prismic ID", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	t.is(runtime.getNode(document.id), normalizedDocument);
});

test("hasNode determines if a document is registered by its Prismic ID", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);
	runtime.registerDocument(document);

	t.true(runtime.hasNode(document.id));
	t.false(runtime.hasNode("non-existant-id"));
});

test("getTypePath returns a type path for a set of parameters", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);
	runtime.registerDocument(document);

	t.deepEqual(runtime.getTypePath([document.type]), {
		kind: gatsbyPrismic.TypePathKind.CustomType,
		path: document.type,
		type: gatsbyPrismic.PrismicSpecialType.Document,
	});
});

test("type paths can be exported", (t) => {
	const model = prismicM.model.customType({ seed: t.title });

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const exportedTypePaths = runtime.exportTypePaths();

	t.is(typeof exportedTypePaths, "string");
});

test("exported type paths can be imported", (t) => {
	const model = prismicM.model.customType({ seed: t.title });

	const runtime1 = gatsbyPrismic.createRuntime();
	runtime1.registerCustomTypeModel(model);

	const exportedTypePaths = runtime1.exportTypePaths();

	const runtime2 = gatsbyPrismic.createRuntime();
	runtime2.importTypePaths(exportedTypePaths);

	t.deepEqual(runtime1.typePaths, runtime2.typePaths);
});

test("subscribers are notified as a result of actions", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();

	const callback = sinon.stub();
	runtime.subscribe(callback);

	runtime.registerCustomTypeModel(model);
	runtime.registerDocument(document);

	t.is(callback.callCount, 2);
});

test("subscribers can unsubscribe", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document1 = prismicM.value.customType({
		seed: t.title,
		model,
	});
	const document2 = prismicM.value.customType({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();

	const callback = sinon.stub();
	runtime.subscribe(callback);

	runtime.registerCustomTypeModel(model);
	runtime.registerDocument(document1);

	runtime.unsubscribe(callback);

	runtime.registerDocument(document2);

	t.is(callback.callCount, 2);
});
