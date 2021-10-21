import * as prismicT from "@prismicio/types";

import {
	NormalizeConfig,
	NormalizedValueMap,
	NormalizerDependencies,
} from "../types";
import { normalize } from "../normalize";

export const isDocumentDataField = (
	value: unknown,
): value is prismicT.PrismicDocument["data"] => {
	return typeof value === "object" && value !== null;
};

type NormalizeDocumentDataConfig<
	Value extends prismicT.PrismicDocument["data"],
> = NormalizeConfig<Value> & NormalizerDependencies;

export type NormalizedDocumentDataValue<
	Value extends prismicT.PrismicDocument["data"] = prismicT.PrismicDocument["data"],
> = NormalizedValueMap<Value>;

export const documentData = <Value extends prismicT.PrismicDocument["data"]>(
	config: NormalizeDocumentDataConfig<Value>,
): NormalizedDocumentDataValue<Value> => {
	const result = {} as NormalizedDocumentDataValue<Value>;

	for (const key in config.value) {
		const transformedKey = config.transformFieldName(
			key,
		) as keyof NormalizedDocumentDataValue<Value>;

		result[transformedKey] = normalize({
			...config,
			value: config.value[key],
			path: [...config.path, transformedKey as string],
		});
	}

	return result;
};
