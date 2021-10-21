import * as prismicT from "@prismicio/types";
import { IterableElement } from "type-fest";

import {
	NormalizeConfig,
	NormalizedValueMap,
	NormalizerDependencies,
} from "../types";
import { normalize } from "../normalize";

export const isSlice = (
	value: unknown,
): value is prismicT.Slice | prismicT.SharedSlice => {
	return typeof value === "object" && value !== null && "slice_type" in value;
};

export const isSharedSlice = (
	value: prismicT.Slice,
): value is prismicT.SharedSlice => "variation" in value;

export type NormalizeSliceConfig<Value extends prismicT.Slice> =
	NormalizeConfig<Value> & NormalizerDependencies;

export type NormalizedSliceValue<
	Value extends prismicT.Slice | prismicT.SharedSlice =
		| prismicT.Slice
		| prismicT.SharedSlice,
> = Value extends prismicT.SharedSlice
	? {
			__typename: string;
			id: string;
			slice_type: Value["slice_type"];
			slice_label: Value["slice_label"];
			variation: string;
			version: string;
			primary: NormalizedValueMap<Value["primary"]>;
			items: NormalizedValueMap<IterableElement<Value["items"]>>[];
	  }
	: {
			__typename: string;
			id: string;
			slice_type: Value["slice_type"];
			slice_label: Value["slice_label"];
			primary: NormalizedValueMap<Value["primary"]>;
			items: NormalizedValueMap<IterableElement<Value["items"]>>[];
	  };

export const slice = <Value extends prismicT.Slice | prismicT.SharedSlice>(
	config: NormalizeSliceConfig<Value>,
): NormalizedSliceValue<Value> => {
	const { primary, items, ...value } = config.value;

	const result = {
		...value,
		__typename: config.nodeHelpers.createTypeName(config.path),
		id: config.nodeHelpers.createNodeId([
			...config.path,
			JSON.stringify(config.value),
		]),
		slice_type: config.value.slice_type,
		slice_label: config.value.slice_label,
	} as unknown as NormalizedSliceValue<Value>;
	// Yes, using `as unknown as X` is bad practice.
	// Yes, you can fix this if you know how to do it.
	// Yes, that means you!

	result.primary = {} as NormalizedSliceValue["primary"];

	for (const key in primary) {
		const transformedKey = config.transformFieldName(
			key,
		) as keyof NormalizedSliceValue["primary"];

		result.primary[transformedKey] = normalize({
			...config,
			value: config.value.primary[key],
			path: [...config.path, "primary", transformedKey],
		});
	}

	result.items = items.map((item) => {
		const result = {} as IterableElement<NormalizedSliceValue["items"]>;

		for (const key in item) {
			const transformedKey = config.transformFieldName(
				key,
			) as keyof IterableElement<NormalizedSliceValue["items"]>;

			result[transformedKey] = normalize({
				...config,
				value: item[key],
				path: [...config.path, "items", transformedKey],
			});
		}

		return result;
	});

	return result;
};
