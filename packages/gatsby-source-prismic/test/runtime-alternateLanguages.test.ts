import test from "ava";
import * as prismicM from "@prismicio/mock";
import * as sinon from "sinon";

import * as gatsbyPrismic from "../src";

test("normalizes Alternate Languages field", (t) => {
	const model = prismicM.model.customType({ seed: t.title });
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});
	document.alternate_languages = [
		{
			id: document.id,
			lang: document.lang,
			type: document.type,
			uid: document.uid ?? undefined,
		},
	];

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	t.plan(3 * document.alternate_languages.length);
	for (let i = 0; i < document.alternate_languages.length; i++) {
		t.is(
			normalizedDocument.alternate_languages[i].document,
			normalizedDocument,
		);
		t.is(
			normalizedDocument.alternate_languages[i].raw,
			document.alternate_languages[i],
		);
		t.notThrows(() =>
			sinon.assert.match(
				normalizedDocument.alternate_languages[i],
				sinon.match(document.alternate_languages[i]),
			),
		);
	}
});
