import * as prismic from "@prismicio/client";
import type { NodeInput, NodePluginArgs } from "gatsby";

import type { FieldModelValueType, PrismicDocumentForModel } from "../types";
import type { PluginOptions } from "../types";

import { createCachedRemoteFileNode } from "./createCachedRemoteFileNode";
import { defaultTransformFieldName } from "./defaultTransformFieldName";
import { fmtLog } from "./fmtLog";
import { pascalCase } from "./pascalCase";
import { shouldDownloadFile } from "./shouldDownloadFile";
import { withoutURLParameter } from "./withoutURLParameter";

type NormalizeDocumentFieldArgs<
	Model extends prismic.CustomTypeModelField = prismic.CustomTypeModelField,
> = {
	model: Model;
	value: FieldModelValueType<Model>;
	path: string[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
	sharedSliceModels: prismic.SharedSliceModel[];
};

type NormalizeDocumentFieldReturnType<
	Model extends prismic.CustomTypeModelField = prismic.CustomTypeModelField,
> = Model extends prismic.CustomTypeModelGroupField
	? prismic.GroupField<{
			[P in keyof NonNullable<
				NonNullable<Model["config"]>["fields"]
			>]: NormalizeDocumentFieldReturnType<
				NonNullable<NonNullable<Model["config"]>["fields"]>[P]
			>;
	  }>
	: Model extends prismic.CustomTypeModelLinkField
	? FieldModelValueType<Model> & { localFile: string | null }
	: Model extends prismic.CustomTypeModelEmbedField
	? string | null
	: Model extends prismic.CustomTypeModelImageField<infer ThumbnailNames>
	? FieldModelValueType<Model> & { localFile: string | null } & {
			[ThumbnailName in keyof ThumbnailNames]: prismic.ImageFieldImage & {
				localFile: string | null;
			};
	  }
	: Model extends prismic.CustomTypeModelIntegrationField
	? string | null
	: FieldModelValueType<Model>;

const normalizeDocumentField = async <
	Model extends prismic.CustomTypeModelField,
>(
	args: NormalizeDocumentFieldArgs<Model>,
): Promise<NormalizeDocumentFieldReturnType<Model>> => {
	const model = args.model;

	switch (model.type) {
		case prismic.CustomTypeModelFieldType.Slices: {
			const value = args.value as prismic.SliceZone;

			if (prismic.isFilled.sliceZone(value)) {
				return (await Promise.all(
					value.map(async (slice) => {
						const sliceModel = model.config?.choices?.[slice.slice_type];
						if (!sliceModel) {
							// TODO: Should an error be thrown or a warning logged if a Slice's model cannot be found?
							return slice;
						}

						switch (sliceModel.type) {
							case prismic.CustomTypeModelSliceType.SharedSlice: {
								const sharedSlice = slice as prismic.SharedSlice;
								const sharedSliceModel = args.sharedSliceModels.find(
									(model) => {
										return model.id === sharedSlice.slice_type;
									},
								);
								const sharedSliceVariationModel =
									sharedSliceModel?.variations.find((variationModel) => {
										return variationModel.id === sharedSlice.variation;
									});

								if (sharedSliceModel && sharedSliceVariationModel) {
									const [primary, items] = await Promise.all([
										normalizeDocumentFieldRecord({
											...args,
											models: sharedSliceVariationModel.primary || {},
											record: sharedSlice.primary,
											path: [
												sharedSliceModel.id,
												sharedSliceVariationModel.id,
												"primary",
											],
										}),
										...sharedSlice.items.map(async (item) => {
											return await normalizeDocumentFieldRecord({
												...args,
												models: sharedSliceVariationModel.items || {},
												record: item,
												path: [
													sharedSliceModel.id,
													sharedSliceVariationModel.id,
													"items",
												],
											});
										}),
									]);

									return {
										...sharedSlice,
										primary,
										items,
									};
								} else {
									// TODO: Improve error handling.
									throw new Error(
										`A Shared Slice model with ID "${slice.slice_type}" was not found.`,
									);
								}
							}

							case prismic.CustomTypeModelSliceType.Slice: {
								const [primary, ...items] = await Promise.all([
									normalizeDocumentFieldRecord({
										...args,
										models: sliceModel["non-repeat"] || {},
										record: slice.primary,
										path: [...args.path, slice.slice_type, "primary"],
									}),
									...slice.items.map(async (item) => {
										return await normalizeDocumentFieldRecord({
											...args,
											models: sliceModel.repeat || {},
											record: item,
											path: [...args.path, slice.slice_type, "items"],
										});
									}),
								]);

								return {
									...slice,
									primary,
									items,
								};
							}

							default: {
								// Unsupport legacy Slice format
								return slice;
							}
						}
					}),
				)) as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return [] as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		case prismic.CustomTypeModelFieldType.Group: {
			const value = args.value as prismic.GroupField;

			if (prismic.isFilled.group(value)) {
				return (await Promise.all(
					value.map(async (item) => {
						return normalizeDocumentFieldRecord({
							...args,
							models: model.config?.fields || {},
							record: item,
						});
					}),
				)) as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return [] as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		case prismic.CustomTypeModelFieldType.Link: {
			const value = args.value as prismic.LinkField;

			if (
				prismic.isFilled.link(value) &&
				value.link_type === prismic.LinkType.Media &&
				(await shouldDownloadFile({
					field: value,
					path: args.path,
					pluginOptions: args.pluginOptions,
				}))
			) {
				const fileNode = await createCachedRemoteFileNode({
					url: value.url,
					gatsbyNodeArgs: args.gatsbyNodeArgs,
				});

				return {
					...value,
					localFile: fileNode.id,
				} as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return {
					...value,
					localFile: null,
				} as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		case prismic.CustomTypeModelFieldType.Image: {
			const value = args.value as prismic.ImageField<string>;

			const thumbnails: Record<
				string,
				prismic.ImageFieldImage & { localFile: string | null }
			> = {};
			if (model.config?.thumbnails) {
				for (const thumbnailModel of model.config.thumbnails) {
					const thumbnailValue = value[thumbnailModel.name];
					const transformedThumbnailName = args.pluginOptions.transformFieldName
						? args.pluginOptions.transformFieldName(thumbnailModel.name)
						: defaultTransformFieldName(thumbnailModel.name);

					if (
						prismic.isFilled.imageThumbnail(thumbnailValue) &&
						(await shouldDownloadFile({
							field: thumbnailValue,
							path: args.path,
							pluginOptions: args.pluginOptions,
						}))
					) {
						const fileNode = await createCachedRemoteFileNode({
							url: withoutURLParameter(thumbnailValue.url, "auto"),
							gatsbyNodeArgs: args.gatsbyNodeArgs,
						});

						thumbnails[transformedThumbnailName] = {
							...thumbnailValue,
							localFile: fileNode.id,
						};
					} else {
						thumbnails[transformedThumbnailName] = {
							...thumbnailValue,
							localFile: null,
						};
					}
				}
			}

			if (
				prismic.isFilled.image(value) &&
				(await shouldDownloadFile({
					field: value,
					path: args.path,
					pluginOptions: args.pluginOptions,
				}))
			) {
				const fileNode = await createCachedRemoteFileNode({
					url: withoutURLParameter(value.url, "auto"),
					gatsbyNodeArgs: args.gatsbyNodeArgs,
				});

				return {
					...value,
					...thumbnails,
					localFile: fileNode.id,
				} as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return {
					...value,
					...thumbnails,
					localFile: null,
				} as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		case prismic.CustomTypeModelFieldType.Embed: {
			const value = args.value as prismic.EmbedField;

			if (prismic.isFilled.embed(value)) {
				const node: NodeInput = {
					...value,
					id: args.gatsbyNodeArgs.createNodeId(value.embed_url),
					internal: {
						type: pascalCase(
							"Prismic",
							args.pluginOptions.typePrefix,
							"EmbedField",
						),
						contentDigest: args.gatsbyNodeArgs.createContentDigest(value),
					},
				};

				args.gatsbyNodeArgs.actions.createNode(node);

				return node.id as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return null as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		case prismic.CustomTypeModelFieldType.Integration: {
			const value = args.value as prismic.IntegrationField;

			if (!model.config?.catalog) {
				throw new Error(
					fmtLog(
						args.pluginOptions.repositoryName,
						`Integration fields must have a catalog configured, but none was found for this field: ${args.path.join(
							".",
						)}`,
					),
				);
			}

			if (prismic.isFilled.integrationField(value)) {
				const contentDigest = args.gatsbyNodeArgs.createContentDigest(value);
				const node: NodeInput = {
					...value,
					id: contentDigest,
					internal: {
						type: pascalCase(
							"Prismic",
							args.pluginOptions.typePrefix,
							model.config.catalog,
							"IntegrationItem",
						),
						contentDigest,
					},
				};

				// `id` is overridden by Gatsby's node, so the original value must be aliased.
				if (value.id) {
					node.prismicId = value.id;
				}

				// `internal` is overridden by Gatsby's node, so the original value must be aliased.
				if (value.internal) {
					node.prismicInternal = value.internal;
				}

				args.gatsbyNodeArgs.actions.createNode(node);

				return node.id as NormalizeDocumentFieldReturnType<Model>;
			} else {
				return null as NormalizeDocumentFieldReturnType<Model>;
			}
		}

		default: {
			return args.value as NormalizeDocumentFieldReturnType<Model>;
		}
	}
};

type NormalizeDocumentFieldRecordArgs<
	Models extends Record<string, prismic.CustomTypeModelField>,
> = Omit<NormalizeDocumentFieldArgs, "model" | "value"> & {
	models: Models;
	record: { [P in keyof Models]: FieldModelValueType<Models[P]> };
};

const normalizeDocumentFieldRecord = async <
	Models extends Record<string, prismic.CustomTypeModelField>,
>(
	args: NormalizeDocumentFieldRecordArgs<Models>,
): Promise<Record<string, NormalizeDocumentFieldReturnType>> => {
	const result: Record<string, NormalizeDocumentFieldReturnType> = {};

	const fieldNames = Object.keys(args.models);

	await Promise.all(
		fieldNames.map(async (fieldName) => {
			if (fieldName !== "uid") {
				const transformedFieldName = args.pluginOptions.transformFieldName
					? args.pluginOptions.transformFieldName(fieldName)
					: defaultTransformFieldName(fieldName);

				result[transformedFieldName] = await normalizeDocumentField({
					...args,
					model: args.models[fieldName],
					value: args.record[fieldName],
					path: [...args.path, transformedFieldName],
				});
			}
		}),
	);

	return result;
};

type NormalizeDocumentArgs<Model extends prismic.CustomTypeModel> = Omit<
	NormalizeDocumentFieldArgs,
	"model" | "value" | "path"
> & {
	document: PrismicDocumentForModel<Model>;
	model: Model;
};

export const normalizeDocument = async <Model extends prismic.CustomTypeModel>(
	args: NormalizeDocumentArgs<Model>,
): Promise<
	Omit<PrismicDocumentForModel<Model>, "data"> & {
		data: Record<string, NormalizeDocumentFieldReturnType>;
	}
> => {
	const models: Model["json"][string] = Object.assign(
		{},
		...Object.values(args.model.json),
	);

	const normalizedData = await normalizeDocumentFieldRecord({
		...args,
		models: models,
		path: [args.model.id],
		record: args.document.data,
	});

	return {
		...args.document,
		data: normalizedData,
	};
};
