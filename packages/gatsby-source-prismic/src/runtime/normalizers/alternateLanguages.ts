import * as prismicT from "@prismicio/types";

import { createGetProxy } from "../createGetProxy";
import { NormalizeConfig, NormalizerDependencies } from "../types";

import { NormalizedDocumentValue } from "./document";

export type NormalizeAlternateLanguagesConfig = NormalizeConfig<
	prismicT.PrismicDocument["alternate_languages"]
> &
	Pick<NormalizerDependencies, "getNode">;

export type NormalizedAlternateLanguagesValue = (prismicT.AlternateLanguage & {
	document?: NormalizedDocumentValue | null;
	raw: prismicT.AlternateLanguage;
})[];

export const alternateLanguages = (
	config: NormalizeAlternateLanguagesConfig,
): NormalizedAlternateLanguagesValue => {
	return config.value.map((alternateLanguage) => {
		const value = {
			...alternateLanguage,
			raw: alternateLanguage,
		};

		return createGetProxy(value, (target, prop, receiver) => {
			if (prop === "document") {
				return config.getNode(value.id) || null;
			}

			return Reflect.get(target, prop, receiver);
		});
	});
};
