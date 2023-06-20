import {
	AnyRegularField,
	Client,
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelFieldType,
	CustomTypeModelGroupField,
	CustomTypeModelSlice,
	CustomTypeModelSliceType,
	CustomTypeModelSliceZoneField,
	GroupField,
	LinkField,
	PrismicDocument,
	SharedSlice,
	SharedSliceModel,
	SliceZone,
} from "@prismicio/client";

import type { PluginOptions, RepositoryConfig } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

import { normalizeDocument } from "./normalizeDocument";

const extractLinkedDocumentIDsFromField = async (
	looseValue: AnyRegularField | GroupField | SliceZone,
	looseModel: CustomTypeModelField,
	sharedSliceModels: SharedSliceModel[],
): Promise<string[]> => {
	switch (looseModel.type) {
		case CustomTypeModelFieldType.Slices: {
			const value = looseValue as SliceZone;

			return (
				await Promise.all(
					value.map(async (slice) => {
						const model = looseModel as CustomTypeModelSliceZoneField;
						const sliceModel = model.config?.choices?.[slice.slice_type] as
							| CustomTypeModelSlice
							| SharedSliceModel
							| undefined;

						if (sliceModel) {
							if (sliceModel.type === CustomTypeModelSliceType.Slice) {
								return (
									await Promise.all([
										extractLinkedDocumentIDsFromFields(
											slice.primary,
											sliceModel["non-repeat"] || {},
											sharedSliceModels,
										),
										...slice.items.map(async (item) => {
											return extractLinkedDocumentIDsFromFields(
												item,
												sliceModel.repeat || {},
												sharedSliceModels,
											);
										}),
									])
								).flat();
							} else if (
								sliceModel.type === CustomTypeModelSliceType.SharedSlice
							) {
								const typedSlice = slice as SharedSlice;
								const variationModel = sharedSliceModels
									.find((m) => m.id === slice.slice_type)
									?.variations.find((m) => m.id === typedSlice.variation);

								if (variationModel) {
									return (
										await Promise.all([
											extractLinkedDocumentIDsFromFields(
												slice.primary,
												variationModel.primary || {},
												sharedSliceModels,
											),
											...slice.items.map(async (item) => {
												return extractLinkedDocumentIDsFromFields(
													item,
													variationModel.items || {},
													sharedSliceModels,
												);
											}),
										])
									).flat();
								} else {
									return [];
								}
							} else {
								return [];
							}
						} else {
							return [];
						}
					}),
				)
			).flat();
		}

		case CustomTypeModelFieldType.Group: {
			const value = looseValue as GroupField;

			return (
				await Promise.all(
					value.map(async (item) => {
						const model = looseModel as CustomTypeModelGroupField;

						return await extractLinkedDocumentIDsFromFields(
							item,
							model.config?.fields || {},
							sharedSliceModels,
						);
					}),
				)
			).flat();
		}

		case CustomTypeModelFieldType.Link: {
			const value = looseValue as LinkField;

			if ("id" in value && !value.isBroken) {
				return [value.id];
			}
		}

		default: {
			return [];
		}
	}
};

const extractLinkedDocumentIDsFromFields = async (
	fields: Record<string, AnyRegularField | GroupField | SliceZone>,
	models: Record<string, CustomTypeModelField>,
	sharedSliceModels: SharedSliceModel[],
): Promise<string[]> => {
	const fieldNames = Object.keys(models);

	return (
		await Promise.all(
			fieldNames.map(async (fieldName) => {
				return extractLinkedDocumentIDsFromField(
					fields[fieldName],
					models[fieldName],
					sharedSliceModels,
				);
			}),
		)
	).flat();
};

const extractLinkedDocumentIDs = async (
	document: PrismicDocument,
	customTypeModels: CustomTypeModel[],
	sharedSliceModels: SharedSliceModel[],
): Promise<string[]> => {
	const model = customTypeModels.find(
		(customTypeModel) => customTypeModel.id === document.type,
	);

	if (model) {
		const fieldModels: CustomTypeModel["json"][string] = Object.assign(
			{},
			...Object.values(model.json),
		);

		const linkedIDs = await extractLinkedDocumentIDsFromFields(
			document.data,
			fieldModels,
			sharedSliceModels,
		);

		const alternateLanguageIDs = document.alternate_languages.map(
			(alternateLanguage) => {
				return alternateLanguage.id;
			},
		);
		linkedIDs.push(...alternateLanguageIDs);

		return linkedIDs;
	} else {
		return [];
	}
};

export const fetchLinkedDocuments = async (
	documents: PrismicDocument[],
	client: Client,
	pluginOptions: PluginOptions,
	repositoryConfig: RepositoryConfig,
	customTypeModels: CustomTypeModel[],
	sharedSliceModels: SharedSliceModel[],
	abortController: AbortController,
	iterationCount = 0,
	maximumIterationCount = 3,
	aggregateAlreadyFetchedIDs: string[] = [],
): Promise<void> => {
	if (iterationCount >= maximumIterationCount) {
		console.warn(
			`The maximum depth to which gatsby-plugin-prismic-previews will fetch linked documents (${maximumIterationCount} levels deep) was reached. Any Link field's \`document\` property nested below ${maximumIterationCount} levels deep will return undefined.`,
		);

		return;
	}

	const alreadyFetchedIDs = [
		...aggregateAlreadyFetchedIDs,
		...documents.map((doc) => doc.id),
	];

	const ids = (
		await Promise.all(
			documents.map(async (doc) => {
				return extractLinkedDocumentIDs(
					doc,
					customTypeModels,
					sharedSliceModels,
				);
			}),
		)
	).flat();

	const prunedIDs = ids.filter((id) => !alreadyFetchedIDs.includes(id));

	if (prunedIDs.length > 0) {
		const fetchedLinkedDocuments = await client.getAllByIDs(
			[...new Set(prunedIDs)],
			{ signal: abortController.signal },
		);

		await Promise.all([
			Promise.all(
				fetchedLinkedDocuments.map(async (doc) => {
					const model = customTypeModels.find(
						(customTypeModel) => customTypeModel.id === doc.type,
					);

					if (model) {
						const normalizedDocument = await normalizeDocument(
							doc,
							model,
							sharedSliceModels,
							pluginOptions,
							repositoryConfig,
						);

						const state = usePrismicPreviewStore.getState();
						state.addDocument(normalizedDocument);
					}
				}),
			),
			fetchLinkedDocuments(
				fetchedLinkedDocuments,
				client,
				pluginOptions,
				repositoryConfig,
				customTypeModels,
				sharedSliceModels,
				abortController,
				iterationCount + 1,
				maximumIterationCount,
				[...alreadyFetchedIDs, ...prunedIDs],
			),
		]);
	}
};
