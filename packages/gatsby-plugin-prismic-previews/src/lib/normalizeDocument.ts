import {
	AnyRegularField,
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelFieldType,
	CustomTypeModelGroupField,
	CustomTypeModelImageField,
	CustomTypeModelSlice,
	CustomTypeModelSliceType,
	CustomTypeModelSliceZoneField,
	GroupField,
	ImageField,
	ImageFieldImage,
	LinkField,
	PrismicDocument,
	RichTextField,
	SharedSlice,
	SharedSliceModel,
	SliceZone,
	asHTML,
	asLink,
	asText,
	isFilled,
} from "@prismicio/client";
import { IUrlBuilderArgs, getImageData } from "gatsby-plugin-image";
import { ImgixURLParams, buildURL } from "imgix-url-builder";

import type {
	NormalizedDocument,
	PluginOptions,
	RepositoryConfig,
} from "../types";

import { DEFAULT_IMGIX_PARAMS } from "../constants";

import { getDocument } from "./getDocument";
import { hasOwnProperty } from "./hasOwnProperty";
import { pascalCase } from "./pascalCase";
import { uuid } from "./uuid";

// TODO: Consider changing the lazy-loading property design (currently using
// getters) to only call the getter once (i.e. cache the result, like
// memoization)

const defaultTransformFieldName = (fieldName: string): string => {
	return fieldName.replace(/-/g, "_");
};

const withDocumentProxy = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TTarget extends Record<any, any>,
>(
	target: TTarget,
	repositoryConfig: RepositoryConfig,
): TTarget => {
	return new Proxy(target, {
		get(target, prop, receiver) {
			if (prop === "document") {
				if (hasOwnProperty(target, "id") && typeof target.id === "string") {
					return getDocument(target.id) || null;
				}
			} else if (prop === "url") {
				if (hasOwnProperty(target, "id") && typeof target.id === "string") {
					const document = getDocument(target.id);

					if (document) {
						return asLink(document.raw, {
							linkResolver: repositoryConfig.linkResolver,
						});
					}
				}
			}

			return Reflect.get(target, prop, receiver);
		},
	});
};

type ImgixGatsbyImageDataUrlBuilderArgs = IUrlBuilderArgs<{
	imageImgixParams?: ImgixURLParams;
}>;

const imgixGatsbyImageDataUrlBuilder = (
	args: ImgixGatsbyImageDataUrlBuilderArgs,
) => {
	return buildURL(args.baseUrl, {
		...DEFAULT_IMGIX_PARAMS,
		...args.options.imageImgixParams,
		fm: args.format && args.format !== "auto" ? args.format : undefined,
		w: args.width,
		h: args.height,
	});
};

const normalizeImageField = (
	image: ImageFieldImage,
	pluginOptions: PluginOptions,
) => {
	return {
		...image,
		get url() {
			if (isFilled.image(image)) {
				return buildURL(image.url, {
					...DEFAULT_IMGIX_PARAMS,
					...pluginOptions.imageImgixParams,
				});
			} else {
				return null;
			}
		},
		get gatsbyImageData() {
			if (isFilled.image(image)) {
				return getImageData({
					baseUrl: image.url,
					sourceWidth: image.dimensions.width,
					sourceHeight: image.dimensions.height,
					urlBuilder: imgixGatsbyImageDataUrlBuilder,
					options: {
						imageImgixParams: pluginOptions.imageImgixParams,
					},
				});
			} else {
				return null;
			}
		},
		get localFile() {
			if (isFilled.image(image)) {
				return {
					publicURL: image.url,
					childImageSharp: {
						get gatsbyImageData() {
							return getImageData({
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								baseUrl: image.url!,
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								sourceWidth: image.dimensions!.width,
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								sourceHeight: image.dimensions!.height,
								urlBuilder: imgixGatsbyImageDataUrlBuilder,
								options: {
									imageImgixParams: pluginOptions.imageImgixParams,
								},
							});
						},
					},
				};
			} else {
				return null;
			}
		},
	};
};

const normalizeField = async (
	looseModel: CustomTypeModelField | undefined,
	looseValue: AnyRegularField | GroupField | SliceZone,
	path: string[],
	sharedSliceModels: SharedSliceModel[],
	repositoryConfig: RepositoryConfig,
	pluginOptions: PluginOptions,
) => {
	switch (looseModel?.type) {
		case CustomTypeModelFieldType.Slices: {
			const value = looseValue as SliceZone;

			if (isFilled.sliceZone(value)) {
				return await Promise.all(
					value.map(async (slice) => {
						const model = looseModel as CustomTypeModelSliceZoneField;
						const sliceModel = model.config?.choices?.[slice.slice_type] as
							| CustomTypeModelSlice
							| SharedSliceModel
							| undefined;

						if (sliceModel) {
							const result: Omit<typeof slice, "primary" | "items"> & {
								__typename: string;
								id: string;
								primary: Record<string, unknown>;
								items: Record<string, unknown>[];
							} = {
								...slice,
								id: uuid(),
								__typename: pascalCase(
									"Prismic",
									pluginOptions.typePrefix,
									...path,
									slice.slice_type,
								),
							};

							if (sliceModel.type === CustomTypeModelSliceType.Slice) {
								result.primary = await normalizeFields(
									slice.primary,
									sliceModel["non-repeat"] || {},
									[...path, slice.slice_type, "primary"],
									sharedSliceModels,
									repositoryConfig,
									pluginOptions,
								);

								result.items = await Promise.all(
									slice.items.map(async (item) => {
										return await normalizeFields(
											item,
											sliceModel.repeat || {},
											[...path, slice.slice_type, "item"],
											sharedSliceModels,
											repositoryConfig,
											pluginOptions,
										);
									}),
								);
							} else if (
								sliceModel.type === CustomTypeModelSliceType.SharedSlice
							) {
								const typedSlice = slice as SharedSlice;
								const sharedSliceModel = sharedSliceModels.find(
									(m) => m.id === slice.slice_type,
								);
								const variationModel = sharedSliceModel?.variations.find(
									(m) => m.id === typedSlice.variation,
								);

								if (sharedSliceModel && variationModel) {
									result.__typename = pascalCase(
										"Prismic",
										pluginOptions.typePrefix,
										sharedSliceModel.id,
									);

									result.primary = await normalizeFields(
										slice.primary,
										variationModel.primary || {},
										[...path, slice.slice_type, "primary"],
										sharedSliceModels,
										repositoryConfig,
										pluginOptions,
									);

									result.items = await Promise.all(
										slice.items.map(async (item) => {
											return await normalizeFields(
												item,
												variationModel.items || {},
												[...path, slice.slice_type, "item"],
												sharedSliceModels,
												repositoryConfig,
												pluginOptions,
											);
										}),
									);
								}
							}

							return result;
						} else {
							return slice;
						}
					}),
				);
			} else {
				return [];
			}
		}

		case CustomTypeModelFieldType.Group: {
			const value = looseValue as GroupField;

			if (isFilled.group(value)) {
				return await Promise.all(
					value.map(async (item) => {
						const model = looseModel as CustomTypeModelGroupField;

						return await normalizeFields(
							item,
							model.config?.fields || {},
							path,
							sharedSliceModels,
							repositoryConfig,
							pluginOptions,
						);
					}),
				);
			} else {
				return [];
			}
		}

		case CustomTypeModelFieldType.Link: {
			const value = looseValue as LinkField;

			const result: Omit<typeof value, "url"> & {
				id?: string;
				url: string | null;
				target?: string | null;
				raw: typeof value;
				document?: unknown;
				localFile: { publicURL: string } | null;
			} = {
				...value,
				target:
					"target" in value && value.target ? value.target || null : undefined,
				url:
					asLink(value, { linkResolver: repositoryConfig.linkResolver }) ??
					null,
				raw: value,
				localFile: null,
			};

			if (value.link_type === "Media" && "url" in value && value.url) {
				result.localFile = {
					publicURL: value.url,
				};
			}

			return withDocumentProxy(result, repositoryConfig);
		}

		case CustomTypeModelFieldType.StructuredText: {
			const value = looseValue as RichTextField;

			return {
				get html() {
					if (isFilled.richText(value)) {
						return asHTML(value, {
							linkResolver: repositoryConfig.linkResolver,
							serializer: repositoryConfig.htmlSerializer,
						});
					} else {
						return null;
					}
				},
				get text() {
					if (isFilled.richText(value)) {
						return asText(value);
					} else {
						return null;
					}
				},
				richText: value,
				raw: value,
			};
		}

		case CustomTypeModelFieldType.Image: {
			const value = looseValue as ImageField<string>;

			const result = {
				...normalizeImageField(value, pluginOptions),
				get thumbnails() {
					const model = looseModel as CustomTypeModelImageField;
					const transformFieldName =
						repositoryConfig.transformFieldName || defaultTransformFieldName;

					if (model.config?.thumbnails) {
						const thumbnails: Record<
							string,
							ReturnType<typeof normalizeImageField>
						> = {};

						for (const thumbnailModel of model.config.thumbnails) {
							const transformedThumbnailName = transformFieldName(
								thumbnailModel.name,
							);

							thumbnails[transformedThumbnailName] = normalizeImageField(
								value[thumbnailModel.name],
								pluginOptions,
							);
						}

						return thumbnails;
					} else {
						return undefined;
					}
				},
			};

			return result;
		}

		default: {
			return looseValue;
		}
	}
};

const normalizeFields = async (
	fields: Record<string, AnyRegularField | GroupField | SliceZone>,
	models: Record<string, CustomTypeModelField>,
	path: string[],
	sharedSliceModels: SharedSliceModel[],
	repositoryConfig: RepositoryConfig,
	pluginOptions: PluginOptions,
) => {
	const result: Record<string, unknown> = {};

	const fieldNames = Object.keys(models);

	await Promise.all(
		fieldNames.map(async (fieldName) => {
			if (fieldName !== "uid") {
				const transformFieldName =
					repositoryConfig.transformFieldName || defaultTransformFieldName;
				const transformedFieldName = transformFieldName(fieldName);

				result[transformedFieldName] = await normalizeField(
					models[fieldName],
					fields[fieldName],
					[...path, fieldName],
					sharedSliceModels,
					repositoryConfig,
					pluginOptions,
				);
			}
		}),
	);

	return result;
};

export const normalizeDocument = async (
	document: PrismicDocument,
	model: CustomTypeModel,
	sharedSliceModels: SharedSliceModel[],
	repositoryConfig: RepositoryConfig,
	pluginOptions: PluginOptions,
): Promise<NormalizedDocument> => {
	const normalizedDocument = {
		...document,
		__typename: pascalCase("Prismic", pluginOptions.typePrefix, model.id),
		_previewable: document.id,
		prismicId: document.id,
		id: uuid(),
		url:
			asLink(document, { linkResolver: repositoryConfig.linkResolver }) ?? null,
		dataRaw: document.data,
		raw: document,
		alternate_languages: document.alternate_languages.map(
			(alternateLanguage) => {
				return withDocumentProxy(alternateLanguage, repositoryConfig);
			},
		),
	};

	if (Object.keys(document.data).length > 0) {
		const fieldModels: CustomTypeModel["json"][string] = Object.assign(
			{},
			...Object.values(model.json),
		);

		normalizedDocument.data = await normalizeFields(
			document.data,
			fieldModels,
			[model.id, "data"],
			sharedSliceModels,
			repositoryConfig,
			pluginOptions,
		);
	}

	return normalizedDocument;
};
