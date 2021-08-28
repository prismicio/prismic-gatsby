import test from "ava";
import * as prismicM from "@prismicio/mock";
import * as sinon from "sinon";

import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";

import * as gatsbyPrismic from "../src";

test("normalizes Group fields", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		group: {
			...prismicM.model.group({ seed: t.title }),
			config: {
				label: "Group",
				fields: {
					richText: prismicM.model.richText({ seed: t.title }),
				},
			},
		},
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	t.plan(normalizedDocument.data.group.length);
	for (let i = 0; i < normalizedDocument.data.group.length; i++) {
		t.notThrows(() =>
			sinon.assert.match(normalizedDocument.data.group[i].richText, {
				text: sinon.match.string,
				html: sinon.match.string,
				richText: document.data.group[i].richText,
				raw: document.data.group[i].richText,
			}),
		);
	}
});
