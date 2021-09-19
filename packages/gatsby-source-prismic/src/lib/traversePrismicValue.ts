import * as prismicT from "@prismicio/types";

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
	};
};

export const traversePrismicValue = <
	Model extends PrismicModel,
	Value extends ModelValue<Model>,
>(
	config: TraversePrismicValueConfig<Model, Value>,
): TraversedPrismicValue<Value> => {
	if ("json" in config.model) {
		config.model;
	}
};
