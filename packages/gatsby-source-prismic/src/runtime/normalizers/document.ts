import * as prismicT from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";
import * as gatsby from "gatsby";

import {
	NormalizeConfig,
	NormalizedValueMap,
	NormalizerDependencies,
} from "../types";
import { normalize } from "../normalize";
import {
	alternateLanguages,
	NormalizedAlternateLanguagesValue,
} from "./alternateLanguages";

export const isDocument = (
	value: unknown,
): value is prismicT.PrismicDocument => {
	return typeof value === "object" && value !== null && "type" in value;
};

type NormalizeDocumentConfig<Value extends prismicT.PrismicDocument> =
	NormalizeConfig<Value> & NormalizerDependencies;

export type NormalizedDocumentValue<
	Value extends prismicT.PrismicDocument = prismicT.PrismicDocument,
> = Omit<Value, "alternate_languages" | "data"> & {
	alternate_languages: NormalizedAlternateLanguagesValue;
	data: NormalizedValueMap<Value["data"]>;
} & gatsby.NodeInput & {
		__typename: string;
		_previewable: string;
		prismicId: string;
	};

export const document = <Value extends prismicT.PrismicDocument>(
	config: NormalizeDocumentConfig<Value>,
): NormalizedDocumentValue<Value> => {
	const hasDataFields = Object.keys(config.value.data).length > 0;

	const fields = {
		...config.value,
		__typename: config.nodeHelpers.createTypeName(config.path),
		_previewable: config.value.id,
		alternate_languages: alternateLanguages({
			...config,
			value: config.value["alternate_languages"],
		}),
		url: prismicH.asLink(config.value, config.linkResolver),
		data: hasDataFields
			? normalize({
					...config,
					value: config.value.data,
					path: [...config.path, "data"],
			  })
			: {},
	};

	return config.nodeHelpers.createNodeFactory(config.value.type)(
		fields,
	) as NormalizedDocumentValue<Value>;
};
