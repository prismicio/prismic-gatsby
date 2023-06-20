import * as prismic from "@prismicio/client";
import type {
	CustomTypeModel,
	CustomTypeModelDefinition,
	HTMLRichTextSerializer,
	ImageFieldImage,
	LinkResolverFunction,
	LinkToMediaField,
	PrismicDocument,
	Route,
	SharedSliceModel,
} from "@prismicio/client";
import type { FetchLike } from "@prismicio/custom-types-client";
import type { NodeInput } from "gatsby";
import type { ImgixURLParams } from "imgix-url-builder";

type ShouldDownloadFilesPredicate = (
	field: ImageFieldImage<"filled"> | LinkToMediaField<"filled">,
) => boolean | Promise<boolean>;

export type PluginOptions<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TLinkResolverFunction extends LinkResolverFunction<any> = LinkResolverFunction,
> = {
	repositoryName: string;
	accessToken?: string;
	apiEndpoint?: string;
	routes?: Route[];
	linkResolver?: TLinkResolverFunction;
	htmlSerializer?: HTMLRichTextSerializer;
	lang?: string;
	predicates?: string | string[];

	webhookSecret?: string;

	typePrefix?: string;

	customTypesApiToken?: string;
	customTypesApiEndpoint?: string;
	schemas?: Record<string, CustomTypeModelDefinition>;
	customTypeModels?: CustomTypeModel[];
	sharedSliceModels?: SharedSliceModel[];

	imageImgixParams?: ImgixURLParams;
	imagePlaceholderImgixParams?: ImgixURLParams;

	transformFieldName?: (fieldName: string) => string;
	shouldDownloadFiles?:
		| boolean
		| ShouldDownloadFilesPredicate
		| Record<string, boolean | ShouldDownloadFilesPredicate>;

	fetch?: FetchLike;
} & (
	| {
			fetchLinks?: string[];
			graphQuery?: never;
	  }
	| {
			fetchLinks?: never;
			graphQuery?: string;
	  }
) &
	(
		| {
				releaseID?: string;
				releaseLabel?: never;
		  }
		| {
				releaseID?: never;
				releaseLabel?: string;
		  }
	);

// Plugins options for public use in `gatsby-config.js`.
export type PublicPluginOptions<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TLinkResolverFunction extends LinkResolverFunction<any> = LinkResolverFunction,
> = PluginOptions<TLinkResolverFunction> & {
	// `undefined` is included to support process.env values. The plugin's
	// `pluginOptionsSchema` will ensure `repositoryName` contains a string value
	// at runtime.
	repositoryName: PluginOptions["repositoryName"] | undefined;
};

export type PrismicDocumentNodeInput = PrismicDocument &
	NodeInput & {
		prismicId: string;
		raw: PrismicDocument;
	};

type ValueOf<
	ObjectType,
	ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType];

export type PrismicDocumentForModel<Model extends prismic.CustomTypeModel> =
	PrismicDocument<MapFieldValueType<Model["json"][string]>>;

export type MapFieldValueType<
	R extends Record<string, prismic.CustomTypeModelField>,
> = {
	[P in keyof R]: FieldModelValueType<R[P]>;
};

export type FieldModelValueType<M extends prismic.CustomTypeModelField> =
	M extends prismic.CustomTypeModelUIDField
		? prismic.PrismicDocument["uid"]
		: M extends prismic.CustomTypeModelBooleanField
		? prismic.BooleanField
		: M extends prismic.CustomTypeModelColorField
		? prismic.ColorField
		: M extends prismic.CustomTypeModelTitleField
		? prismic.RichTextField // Purposely not set to prismict.TitleField due to type issues in `lib/normalizeDocument.ts`
		: M extends prismic.CustomTypeModelRichTextField
		? prismic.RichTextField
		: M extends prismic.CustomTypeModelImageField
		? prismic.ImageField
		: M extends prismic.CustomTypeModelLinkField
		? prismic.LinkField
		: M extends prismic.CustomTypeModelLinkToMediaField
		? prismic.LinkToMediaField
		: M extends prismic.CustomTypeModelContentRelationshipField
		? prismic.ContentRelationshipField
		: M extends prismic.CustomTypeModelDateField
		? prismic.DateField
		: M extends prismic.CustomTypeModelTimestampField
		? prismic.TimestampField
		: M extends prismic.CustomTypeModelNumberField
		? prismic.NumberField
		: M extends prismic.CustomTypeModelKeyTextField
		? prismic.KeyTextField
		: M extends prismic.CustomTypeModelSelectField
		? prismic.SelectField
		: M extends prismic.CustomTypeModelEmbedField
		? prismic.EmbedField
		: M extends prismic.CustomTypeModelGeoPointField
		? prismic.GeoPointField
		: M extends prismic.CustomTypeModelIntegrationField
		? prismic.IntegrationField
		: M extends prismic.CustomTypeModelGroupField
		? prismic.GroupField<
				MapFieldValueType<NonNullable<NonNullable<M["config"]>["fields"]>>
		  >
		: M extends prismic.CustomTypeModelSliceZoneField
		? prismic.SliceZone<
				ValueOf<{
					[P in keyof NonNullable<
						NonNullable<M["config"]>["choices"]
					>]: NonNullable<
						NonNullable<M["config"]>["choices"]
					>[P] extends prismic.CustomTypeModelSlice
						? prismic.Slice<
								P extends string ? P : string,
								MapFieldValueType<
									NonNullable<
										NonNullable<
											NonNullable<M["config"]>["choices"]
										>[P]["non-repeat"]
									>
								>,
								MapFieldValueType<
									NonNullable<
										NonNullable<
											NonNullable<M["config"]>["choices"]
										>[P]["repeat"]
									>
								>
						  >
						: NonNullable<
								NonNullable<M["config"]>["choices"]
						  >[P] extends prismic.CustomTypeModelSharedSlice
						? prismic.SharedSlice<P extends string ? P : string>
						: never;
				}>
		  >
		: never;
