import * as prismicT from "@prismicio/types";

import {
	PrismicSpecialType,
	TransformFieldNameFn,
	TypePath,
	TypePathKind,
} from "../types";

const fieldToTypePaths = <
	Model extends prismicT.CustomTypeModelField | prismicT.CustomTypeModelSlice,
>(
	path: string[],
	model: Model,
	transformFieldName: TransformFieldNameFn,
): TypePath[] => {
	switch (model.type) {
		case prismicT.CustomTypeModelFieldType.UID: {
			return [];
		}

		case prismicT.CustomTypeModelFieldType.Group: {
			const fields = Object.entries(model.config.fields).flatMap(
				([fieldId, fieldModel]) =>
					fieldToTypePaths(
						[...path, transformFieldName(fieldId)],
						fieldModel,
						transformFieldName,
					),
			);

			return [{ kind: TypePathKind.Field, type: model.type, path }, ...fields];
		}

		case prismicT.CustomTypeModelFieldType.Slices: {
			const choices = Object.entries(model.config.choices)
				.filter(
					(entry): entry is [string, prismicT.CustomTypeModelSlice] =>
						entry[1].type === prismicT.CustomTypeModelSliceType.Slice,
				)
				.flatMap(([choiceId, choiceModel]) =>
					fieldToTypePaths(
						[...path, choiceId],
						choiceModel,
						transformFieldName,
					),
				);

			return [{ kind: TypePathKind.Field, type: model.type, path }, ...choices];
		}

		case prismicT.CustomTypeModelSliceType.Slice: {
			const primary = Object.entries(model["non-repeat"] || {}).flatMap(
				([fieldId, fieldModel]) =>
					fieldToTypePaths(
						[...path, "primary", transformFieldName(fieldId)],
						fieldModel,
						transformFieldName,
					),
			);

			const items = Object.entries(model.repeat || {}).flatMap(
				([fieldId, fieldModel]) =>
					fieldToTypePaths(
						[...path, "items", transformFieldName(fieldId)],
						fieldModel,
						transformFieldName,
					),
			);

			return [
				{ kind: TypePathKind.Field, type: model.type, path },
				...primary,
				...items,
			];
		}

		default: {
			return [
				{
					kind: TypePathKind.Field,
					path,
					type: model.type,
				},
			];
		}
	}
};

export const customTypeModelToTypePaths = <
	Model extends prismicT.CustomTypeModel,
>(
	customTypeModel: Model,
	transformFieldName: TransformFieldNameFn,
): TypePath[] => {
	const definition = customTypeModel.json;
	const fieldModels = Object.assign({}, ...Object.values(definition)) as Record<
		string,
		prismicT.CustomTypeModelField
	>;

	const hasDataFields =
		Object.values(fieldModels).filter(
			(fieldModel) => fieldModel.type !== prismicT.CustomTypeModelFieldType.UID,
		).length > 0;

	const documentTypePath = {
		kind: TypePathKind.CustomType,
		type: PrismicSpecialType.Document,
		path: [customTypeModel.id],
	};

	if (hasDataFields) {
		const data = Object.entries(fieldModels).flatMap(([fieldId, fieldModel]) =>
			fieldToTypePaths(
				[customTypeModel.id, "data", transformFieldName(fieldId)],
				fieldModel,
				transformFieldName,
			),
		);

		return [
			documentTypePath,
			{
				kind: TypePathKind.Field,
				type: PrismicSpecialType.DocumentData,
				path: [customTypeModel.id, "data"],
			},
			...data,
		];
	} else {
		return [documentTypePath];
	}
};

export const sharedSliceModelToTypePaths = <
	Model extends prismicT.SharedSliceModel,
>(
	sharedSliceModel: Model,
	transformFieldName: TransformFieldNameFn,
): TypePath[] => {
	return sharedSliceModel.variations.flatMap((variation) => {
		const primary = Object.entries(variation.primary).flatMap(
			([fieldId, fieldModel]) =>
				fieldToTypePaths(
					[
						sharedSliceModel.id,
						variation.id,
						"primary",
						transformFieldName(fieldId),
					],
					fieldModel,
					transformFieldName,
				),
		);

		const items = Object.entries(variation.items).flatMap(
			([fieldId, fieldModel]) =>
				fieldToTypePaths(
					[
						sharedSliceModel.id,
						variation.id,
						"items",
						transformFieldName(fieldId),
					],
					fieldModel,
					transformFieldName,
				),
		);

		return [
			{
				kind: TypePathKind.SharedSliceVariation,
				type: PrismicSpecialType.SharedSliceVariation,
				path: [sharedSliceModel.id, variation.id],
			},
			...primary,
			...items,
		];
	});
};
