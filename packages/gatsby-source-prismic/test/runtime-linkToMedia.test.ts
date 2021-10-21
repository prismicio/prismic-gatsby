import test from "ava";
import * as prismicH from "@prismicio/helpers";
import * as prismicM from "@prismicio/mock";
import * as sinon from "sinon";

import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";

import * as gatsbyPrismic from "../src";

test("normalizes Link to Media fields", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		linkToMedia: prismicM.model.linkToMedia({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	if (
		"url" in document.data.linkToMedia &&
		"url" in normalizedDocument.data.linkToMedia
	) {
		t.is(
			normalizedDocument.data.linkToMedia.url,
			prismicH.asLink(document.data.linkToMedia),
		);
		t.deepEqual(normalizedDocument.data.linkToMedia.localFile, {
			publicURL: document.data.linkToMedia.url,
		});
		t.is(normalizedDocument.data.linkToMedia.raw, document.data.linkToMedia);
		t.notThrows(() =>
			sinon.assert.match(
				normalizedDocument.data.linkToMedia,
				sinon.match(document.data.linkToMedia),
			),
		);
	} else {
		t.fail();
	}
});
