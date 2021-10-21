import test from "ava";
import * as prismicH from "@prismicio/helpers";
import * as prismicM from "@prismicio/mock";
import * as prismicT from "@prismicio/types";
import * as sinon from "sinon";

import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";

import * as gatsbyPrismic from "../src";

test("normalizes Content Relationship fields", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		contentRelationship: prismicM.model.contentRelationship({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});
	document.data.contentRelationship = prismicM.value.contentRelationship({
		seed: t.title,
		linkableDocuments: [document],
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	if (
		"url" in document.data.contentRelationship &&
		"url" in normalizedDocument.data.contentRelationship
	) {
		t.is(
			normalizedDocument.data.contentRelationship.url,
			prismicH.asLink(document.data.contentRelationship),
		);
		t.is(
			normalizedDocument.data.contentRelationship.document,
			normalizedDocument,
		);
		t.is(normalizedDocument.data.contentRelationship.localFile, undefined);
		t.is(
			normalizedDocument.data.contentRelationship.raw,
			document.data.contentRelationship,
		);
		t.notThrows(() =>
			sinon.assert.match(
				normalizedDocument.data.contentRelationship,
				sinon.match(document.data.contentRelationship),
			),
		);
	} else {
		t.fail();
	}
});

test("uses Link Resolver for url field if one is provided to the runtime", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		contentRelationship: prismicM.model.contentRelationship({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
		withURL: false,
	});
	document.data.contentRelationship = prismicM.value.contentRelationship({
		seed: t.title,
		linkableDocuments: [document],
	});

	const linkResolver: prismicH.LinkResolverFunction = (doc) => `/${doc.uid}`;
	const runtime = gatsbyPrismic.createRuntime({ linkResolver });
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	if ("url" in normalizedDocument.data.contentRelationship) {
		t.is(
			normalizedDocument.data.contentRelationship.url,
			prismicH.asLink(document.data.contentRelationship, linkResolver),
		);
	} else {
		t.fail();
	}
});

test("document field returns null if the document node does not exist", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		contentRelationship: prismicM.model.contentRelationship({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});
	document.data.contentRelationship = prismicM.value.contentRelationship({
		seed: t.title,
		linkableDocuments: [document],
	});
	(document.data.contentRelationship as prismicT.FilledLinkToDocumentField).id =
		"non-existent";

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	if (
		"url" in document.data.contentRelationship &&
		"url" in normalizedDocument.data.contentRelationship
	) {
		t.is(normalizedDocument.data.contentRelationship.document, null);
	} else {
		t.fail();
	}
});
