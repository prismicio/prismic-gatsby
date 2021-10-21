import { ExecutionContext } from "ava";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import { createAllNamedMockFieldModels } from "./createAllNamedMockFieldModels";
import { createMockCustomTypeModelWithFields } from "./createMockCustomTypeModelWithFields";

export const createMockKitchenSinkCustomTypeModel = (
	t: ExecutionContext,
): prismicT.CustomTypeModel => {
	return createMockCustomTypeModelWithFields(t, {
		...createAllNamedMockFieldModels(t),
		group: {
			...prismicM.model.group({ seed: t.title }),
			config: {
				label: "Group",
				fields: createAllNamedMockFieldModels(t),
			},
		},
		sliceZone: {
			...prismicM.model.sliceZone({ seed: t.title }),
			config: {
				labels: {},
				choices: {
					slice: {
						...prismicM.model.slice({ seed: t.title }),
						"non-repeat": createAllNamedMockFieldModels(t),
						repeat: createAllNamedMockFieldModels(t),
					},
					sharedSlice: prismicM.model.sharedSliceChoice(),
				},
			},
		},
	});
};
