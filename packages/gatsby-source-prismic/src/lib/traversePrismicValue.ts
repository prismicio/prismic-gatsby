import * as prismicT from "@prismicio/types";

const isCustomTypeModel = (args: {
	model: PrismicModel;
	value: unknown;
}): args is {
	model: prismicT.CustomTypeModel;
	value: prismicT.PrismicDocument;
} => {
	return "json" in args.model;
};

const isSharedSliceModelVariation = (args: {
	model: PrismicModel;
	value: unknown;
}): args is {
	model: prismicT.SharedSliceModelVariation;
	value: prismicT.SharedSliceVariation;
} => {
	return "docURL" in args.model;
};

export type IterableElement<TargetIterable> = TargetIterable extends Iterable<
	infer ElementType
>
	? ElementType
	: TargetIterable extends AsyncIterable<infer ElementType>
	? ElementType
	: never;

export type ValueOf<
	ObjectType,
	ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType];

type PrismicModel =
	| prismicT.CustomTypeModel
	| prismicT.CustomTypeModelField
	| prismicT.CustomTypeModelSlice
	| prismicT.SharedSliceModel
	| prismicT.SharedSliceModelVariation;

type ModelValueMap<T extends Record<string, prismicT.CustomTypeModelField>> = {
	[P in keyof T]: ModelValue<T[P]>;
};

type ModelValue<T extends PrismicModel> = T extends prismicT.CustomTypeModel
	? CustomTypeModelValue<T>
	: T extends prismicT.CustomTypeModelUIDField
	? prismicT.PrismicDocument["uid"]
	: T extends prismicT.CustomTypeModelFieldForGroup
	? CustomTypeModelFieldForGroupValue<T>
	: T extends prismicT.CustomTypeModelGroupField
	? CustomTypeModelGroupFieldValue<T>
	: T extends prismicT.CustomTypeModelSliceZoneField
	? prismicT.SliceZone
	: T extends prismicT.CustomTypeModelSlice
	? CustomTypeModelSliceValue<T>
	: T extends prismicT.CustomTypeModelSharedSlice
	? // TODO: Allow providing a union of of Shared Slices
	  prismicT.SharedSlice
	: T extends prismicT.SharedSliceModel
	? SharedSliceModelValue<T>
	: T extends prismicT.SharedSliceModelVariation
	? SharedSliceModelVariationValue<T>
	: never;

type CustomTypeModelValue<T extends prismicT.CustomTypeModel> =
	prismicT.PrismicDocument<ModelValueMap<ValueOf<T["json"]>>>;

type CustomTypeModelFieldForGroupValue<
	T extends prismicT.CustomTypeModelFieldForGroup,
> = T extends prismicT.CustomTypeModelBooleanField
	? prismicT.BooleanField
	: T extends prismicT.CustomTypeModelColorField
	? prismicT.ColorField
	: T extends prismicT.CustomTypeModelTitleField
	? prismicT.TitleField
	: T extends prismicT.CustomTypeModelRichTextField
	? prismicT.RichTextField
	: T extends prismicT.CustomTypeModelImageField
	? prismicT.ImageField
	: T extends prismicT.CustomTypeModelLinkField
	? prismicT.LinkField
	: T extends prismicT.CustomTypeModelLinkToMediaField
	? prismicT.LinkToMediaField
	: T extends prismicT.CustomTypeModelContentRelationshipField
	? prismicT.RelationField
	: T extends prismicT.CustomTypeModelDateField
	? prismicT.DateField
	: T extends prismicT.CustomTypeModelTimestampField
	? prismicT.TimestampField
	: T extends prismicT.CustomTypeModelNumberField
	? prismicT.NumberField
	: T extends prismicT.CustomTypeModelKeyTextField
	? prismicT.KeyTextField
	: T extends prismicT.CustomTypeModelSelectField
	? prismicT.SelectField
	: T extends prismicT.CustomTypeModelEmbedField
	? prismicT.EmbedField
	: T extends prismicT.CustomTypeModelGeoPointField
	? prismicT.GeoPointField
	: T extends prismicT.CustomTypeModelIntegrationFieldsField
	? prismicT.IntegrationFields
	: never;

type CustomTypeModelGroupFieldValue<
	T extends prismicT.CustomTypeModelGroupField,
> = prismicT.GroupField<ModelValueMap<T["config"]["fields"]>>;

type CustomTypeModelSliceValue<T extends prismicT.CustomTypeModelSlice> =
	prismicT.Slice<
		string,
		ModelValueMap<T["non-repeat"]>,
		ModelValueMap<T["repeat"]>
	>;

type SharedSliceModelValue<T extends prismicT.SharedSliceModel> =
	prismicT.SharedSlice<
		T["id"],
		SharedSliceModelVariationValue<IterableElement<T["variations"]>>
	>;

type SharedSliceModelVariationValue<
	T extends prismicT.SharedSliceModelVariation,
> = prismicT.SharedSlice<
	string,
	prismicT.SharedSliceVariation<
		T["id"],
		ModelValueMap<T["primary"]>,
		ModelValueMap<T["items"]>
	>
>;

export type TraversedPrismicValue<Value> = unknown;

type VisitorArgs<Model extends PrismicModel, Value> = {
	model: Model;
	value: Value;
	path: string[];
};

type Visitor<Model extends PrismicModel, Value> = (
	args: VisitorArgs<Model, Value>,
) => Promise<unknown>;

type TraversePrismicValueConfig<
	Model extends PrismicModel,
	Value extends ModelValue<Model>,
> = {
	model: Model;
	value: Value;
	path: string[];
	visitors: {
		embed?: Visitor<prismicT.CustomTypeModelEmbedField, prismicT.EmbedField>;
		integrationFields?: Visitor<
			prismicT.CustomTypeModelIntegrationFieldsField,
			prismicT.IntegrationFields
		>;
		link?: Visitor<prismicT.CustomTypeModelLinkField, prismicT.LinkField>;
		image?: Visitor<prismicT.CustomTypeModelImageField, prismicT.ImageField>;
		structuredText?: Visitor<
			| prismicT.CustomTypeModelTitleField
			| prismicT.CustomTypeModelRichTextField,
			prismicT.TitleField | prismicT.RichTextField
		>;
	};
};

export const traversePrismicValue = async <
	Model extends PrismicModel,
	Value extends ModelValue<Model>,
>(
	config: TraversePrismicValueConfig<Model, Value>,
): Promise<TraversedPrismicValue<Value>> => {
	if (isCustomTypeModel(config)) {
		const value = config.value as prismicT.PrismicDocument;

		const fieldModels = Object.assign(
			{},
			...Object.values(config.model.json),
		) as prismicT.CustomTypeModelTab;

		const data: unknown = {};

		for (const fieldKey in config.value.data) {
			data[fieldKey] = await traversePrismicValue({
				model: fieldModels[fieldKey],
				value: value.data[fieldKey],
				visitors: config.visitors,
				path: [...config.path, "data", fieldKey],
			});
		}

		return {
			...value,
			data,
		};
	} else if (isSharedSliceModelVariation(config)) {
		const value = config.value as prismicT.SharedSliceVariation;
		const model = config.model as prismicT.SharedSliceModelVariation;

		const primary: unknown = {};

		for (const fieldKey in value.primary) {
			primary[fieldKey] = await traversePrismicValue({
				model: model.primary[fieldKey],
				value: value.primary[fieldKey],
				visitors: config.visitors,
				path: [...config.path, "items", fieldKey],
			});
		}

		const items = await Promise.all(
			value.items.map(async (item) => {
				const result: unknown = {};

				for (const fieldKey in item) {
					result[fieldKey] = await traversePrismicValue({
						model: model.items[fieldKey],
						value: item[fieldKey],
						visitors: config.visitors,
						path: [...config.path, "items", fieldKey],
					});
				}

				return result;
			}),
		);

		return {
			...value,
			primary,
			items,
		};
	} else if ("type" in config.model) {
		switch (config.model.type) {
			case prismicT.CustomTypeModelFieldType.Group: {
				const value = config.value as prismicT.GroupField;
				const model = config.model as prismicT.CustomTypeModelGroupField;

				return await Promise.all(
					value.map(async (element) => {
						const result: unknown = {};

						for (const key in element) {
							result[key] = await traversePrismicValue({
								model: model.config.fields[key],
								value: element[key],
								visitors: config.visitors,
								path: [...config.path, key],
							});
						}

						return result;
					}),
				);
			}

			case prismicT.CustomTypeModelFieldType.Slices: {
				const value = config.value as prismicT.SliceZone;
				const model = config.model as prismicT.CustomTypeModelSliceZoneField;

				return Promise.all(
					value.map(async (element) => {
						return await traversePrismicValue({
							model: model.config.choices[element.slice_type],
							value: element,
							visitors: config.visitors,
							path:
								"variation" in element
									? [element.slice_type, element.variation]
									: [...config.path, element.slice_type],
						});
					}),
				);
			}

			case prismicT.CustomTypeModelSliceType.Slice: {
				const value = config.value as prismicT.Slice;
				const model = config.model as prismicT.CustomTypeModelSlice;

				const primary: unknown = {};

				for (const fieldKey in value.primary) {
					primary[fieldKey] = await traversePrismicValue({
						model: model["non-repeat"][fieldKey],
						value: value.primary[fieldKey],
						visitors: config.visitors,
						path: [...config.path, "items", fieldKey],
					});
				}

				const items = await Promise.all(
					value.items.map(async (item) => {
						const result: unknown = {};

						for (const fieldKey in item) {
							result[fieldKey] = await traversePrismicValue({
								model: model.repeat[fieldKey],
								value: item[fieldKey],
								visitors: config.visitors,
								path: [...config.path, "items", fieldKey],
							});
						}

						return result;
					}),
				);

				return {
					...value,
					primary,
					items,
				};
			}

			default: {
				const visitors = {
					[prismicT.CustomTypeModelFieldType.Image]: config.visitors.image,
					[prismicT.CustomTypeModelFieldType.Embed]: config.visitors.embed,
					[prismicT.CustomTypeModelFieldType.IntegrationFields]:
						config.visitors.integrationFields,
					[prismicT.CustomTypeModelFieldType.Link]: config.visitors.link,
					[prismicT.CustomTypeModelFieldType.StructuredText]:
						config.visitors.structuredText,
				};
				const visitor = visitors[config.model.type as keyof typeof visitors];

				if (visitor) {
					return await visitor({
						model: config.model as Parameters<typeof visitor>[0]["model"],
						value: config.value as Parameters<typeof visitor>[0]["value"],
						path: config.path,
					});
				} else {
					return config.value;
				}
			}
		}
	}
};
