import * as ava from "ava";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

export const createMockCustomTypeModelWithFields = <
	Fields extends Record<string, prismicT.CustomTypeModelField>,
>(
	t: ava.ExecutionContext,
	fields: Fields,
): prismicT.CustomTypeModel<string, Record<"Main", Fields>> => {
	return {
		...prismicM.model.customType({
			seed: t.title,
			tabsCount: 0,
		}),
		json: {
			Main: {
				uid: prismicM.model.uid({ seed: t.title }),
				...fields,
			},
		},
	};
};
