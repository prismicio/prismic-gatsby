import {
	ContentRelationshipField,
	CustomTypeModelField,
	CustomTypeModelFieldType,
	CustomTypeModelLinkSelectType,
	CustomTypeModelSliceType,
	GeoPointField,
	ImageField,
	KeyTextField,
	LinkField,
	LinkToMediaField,
	SharedSlice,
	SharedSliceModel,
	Slice,
	isFilled,
} from "@prismicio/client";
import type { NodePluginArgs } from "gatsby";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import type { PluginOptions } from "../types";

import { buildImageObjectType } from "./buildImageObjectType";
import { defaultTransformFieldName } from "./defaultTransformFieldName";
import { fieldModelsRecordToGraphQLType } from "./fieldModelsRecordToGraphQLType";
import { fmtLog } from "./fmtLog";
import { pascalCase } from "./pascalCase";

export type FieldModelToGraphQLConfigArgs = {
	path: string[];
	model: CustomTypeModelField;
	sharedSliceModels: SharedSliceModel[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const fieldModelToGraphQLConfig = (
	args: FieldModelToGraphQLConfigArgs,
):
	| ObjectTypeComposerFieldConfigAsObjectDefinition<
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			any,
			Record<string, unknown>
	  >
	| undefined => {
	switch (args.model.type) {
		case CustomTypeModelFieldType.Boolean: {
			return {
				type: "Boolean",
				description: "A Boolean field.",
			};
		}

		case CustomTypeModelFieldType.Color: {
			return {
				type: "String",
				description: "A Color field.",
			};
		}

		case CustomTypeModelFieldType.Date: {
			return {
				type: "Date",
				description: "A Date field.",
				extensions: { dateformat: {} },
			};
		}

		case CustomTypeModelFieldType.Embed: {
			return {
				type: pascalCase(
					"Prismic",
					args.pluginOptions.typePrefix,
					"EmbedField",
				),
				description: "An Embed field.",
				extensions: { link: {} },
			};
		}

		case CustomTypeModelFieldType.GeoPoint: {
			return {
				type: "PrismicGeoPointField",
				description: "A GeoPoint field.",
				resolve: (
					source,
					_args,
					_context,
					info,
				): GeoPointField<"filled"> | null => {
					const field = source[info.fieldName] as GeoPointField;

					if (isFilled.geoPoint(field)) {
						return field;
					} else {
						return null;
					}
				},
			};
		}

		case CustomTypeModelFieldType.Group: {
			const type = fieldModelsRecordToGraphQLType({
				...args,
				models: args.model.config?.fields || {},
			});
			type.config.name = pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				args.path.join(" "),
				"Item",
			);
			type.config.description = "An item for a Group field.";

			args.gatsbyNodeArgs.actions.createTypes(type);

			return {
				type: `[${type.config.name}!]!`,
				description: "A Group field.",
			};
		}

		case CustomTypeModelFieldType.Image: {
			if (
				args.model.config?.thumbnails &&
				args.model.config.thumbnails.length > 0
			) {
				const type = buildImageObjectType({
					schema: args.gatsbyNodeArgs.schema,
					cache: args.gatsbyNodeArgs.cache,
					pluginOptions: args.pluginOptions,
				});
				type.config.name = pascalCase(
					"Prismic",
					args.pluginOptions.typePrefix,
					args.path.join(" "),
					"ImageField",
				);

				const thumbnailsType = args.gatsbyNodeArgs.schema.buildObjectType({
					name: pascalCase(
						"Prismic",
						args.pluginOptions.typePrefix,
						args.path.join(" "),
						"ImageFieldThumbnails",
					),
					description: "Thumbnails for an image field.",
					fields: {},
				});

				for (const thumbnailModel of args.model.config.thumbnails) {
					if (thumbnailsType.config.fields) {
						const transformedThumbnailName = args.pluginOptions
							.transformFieldName
							? args.pluginOptions.transformFieldName(thumbnailModel.name)
							: defaultTransformFieldName(thumbnailModel.name);

						thumbnailsType.config.fields[transformedThumbnailName] = {
							type: pascalCase(
								"Prismic",
								args.pluginOptions.typePrefix,
								"ImageField",
							),
						};
					}
				}

				if (type.config.fields) {
					type.config.fields.thumbnails = {
						type: `${thumbnailsType.config.name}!`,
						description: "Thumbnails for the image field.",
						resolve: (source: ImageField) => {
							return source;
						},
					};
				}

				args.gatsbyNodeArgs.actions.createTypes(thumbnailsType);
				args.gatsbyNodeArgs.actions.createTypes(type);

				return {
					type: type.config.name,
					description: "An Image field with thumbnails.",
				};
			} else {
				return {
					type: pascalCase(
						"Prismic",
						args.pluginOptions.typePrefix,
						"ImageField",
					),
					description: "An Image field.",
				};
			}
		}

		case CustomTypeModelFieldType.Link: {
			const type = pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				"LinkField",
			);

			switch (args.model.config?.select) {
				case CustomTypeModelLinkSelectType.Document: {
					return {
						type,
						description: "A Content Relationship field.",
						resolve: (
							source: Record<string, unknown>,
							_args,
							_context,
							info,
						): ContentRelationshipField<"filled"> | null => {
							const field = source[info.fieldName] as ContentRelationshipField;

							if (isFilled.contentRelationship(field)) {
								return field;
							} else {
								return null;
							}
						},
					};
				}

				case CustomTypeModelLinkSelectType.Media: {
					return {
						type,
						description: `A Link to Media field.\n\nTo download linked files locally and populate the \`localFile\` field, add the following path to \`gatsby-source-prismic\`'s \`shouldDownloadFiles\` option:\n\n\`"${args.path.join(
							".",
						)}": true,\``,
						resolve: (
							source: Record<string, unknown>,
							_args,
							_context,
							info,
						): LinkToMediaField<"filled"> | null => {
							const field = source[info.fieldName] as LinkToMediaField;

							if (isFilled.linkToMedia(field)) {
								return field;
							} else {
								return null;
							}
						},
					};
				}

				case null:
				default: {
					return {
						type,
						description: `A Link field.\n\nTo download linked files locally and populate the \`localFile\` field, add the following path to \`gatsby-source-prismic\`'s \`shouldDownloadFiles\` option:\n\n\`"${args.path.join(
							".",
						)}": true,\``,
						resolve: (
							source: Record<string, unknown>,
							_args,
							_context,
							info,
						): LinkField<"filled"> | null => {
							const field = source[info.fieldName] as LinkField;

							if (isFilled.link(field)) {
								return field;
							} else {
								return null;
							}
						},
					};
				}
			}
		}

		case CustomTypeModelFieldType.Number: {
			return {
				type: "Float",
				description: "A Number field.",
			};
		}

		case CustomTypeModelFieldType.Select: {
			if (args.model.config?.default_value !== undefined) {
				return {
					type: "String",
					description: `A Select field with a default value. **Default value**: ${args.model.config.default_value}`,
				};
			} else {
				return {
					type: "String",
					description: "A Select field without a default value.",
				};
			}
		}

		case CustomTypeModelFieldType.Slices: {
			let choiceTypeNames: string[] = [];

			if (args.model.config?.choices) {
				for (const sliceType in args.model.config.choices) {
					const model = args.model.config.choices[sliceType];

					switch (model.type) {
						case CustomTypeModelSliceType.SharedSlice: {
							const sharedSliceModel = args.sharedSliceModels.find((model) => {
								return model.id === sliceType;
							});

							if (sharedSliceModel) {
								for (const variation of sharedSliceModel.variations) {
									choiceTypeNames = [
										...choiceTypeNames,
										pascalCase(
											"Prismic",
											args.pluginOptions.typePrefix,
											sliceType,
											"Slice",
											variation.id,
										),
									];
								}
							}

							break;
						}

						case CustomTypeModelSliceType.Slice: {
							const type = args.gatsbyNodeArgs.schema.buildObjectType({
								name: pascalCase(
									"Prismic",
									args.pluginOptions.typePrefix,
									args.path.join(" "),
									sliceType,
								),
								fields: {
									id: {
										type: "ID!",
										resolve: (source: Slice | SharedSlice): string => {
											return (
												source.id ||
												args.gatsbyNodeArgs.createNodeId(
													args.gatsbyNodeArgs.createContentDigest(source),
												)
											);
										},
									},
									slice_type: {
										type: "String!",
									},
									slice_label: {
										type: "String",
									},
								},
								interfaces: ["PrismicSlice"],
							});

							if (
								model["non-repeat"] &&
								Object.keys(model["non-repeat"]).length > 0
							) {
								const primaryType = fieldModelsRecordToGraphQLType({
									...args,
									path: [...args.path, sliceType, "primary"],
									models: model["non-repeat"],
								});

								args.gatsbyNodeArgs.actions.createTypes(primaryType);

								if (type.config.fields) {
									type.config.fields.primary = {
										type: `${primaryType.config.name}!`,
									};
								}
							}

							if (model.repeat && Object.keys(model.repeat).length > 0) {
								const itemType = fieldModelsRecordToGraphQLType({
									...args,
									path: [...args.path, sliceType, "items"],
									models: model.repeat,
								});
								itemType.config.name = pascalCase(
									"Prismic",
									args.pluginOptions.typePrefix,
									args.path.join(" "),
									sliceType,
									"item",
								);

								args.gatsbyNodeArgs.actions.createTypes(itemType);

								if (type.config.fields) {
									type.config.fields.items = {
										type: `[${itemType.config.name}!]!`,
									};
								}
							}

							args.gatsbyNodeArgs.actions.createTypes(type);

							choiceTypeNames = [...choiceTypeNames, type.config.name];

							break;
						}

						default: {
							throw new Error(
								fmtLog(
									args.pluginOptions.repositoryName,
									`Legacy Slices are not supported, but were found at this field: ${args.path.join(
										".",
									)}`,
								),
							);
						}
					}
				}
			}

			if (choiceTypeNames.length > 0) {
				const type = args.gatsbyNodeArgs.schema.buildUnionType({
					name: pascalCase(
						"Prismic",
						args.pluginOptions.typePrefix,
						args.path.join(" "),
					),
					types: choiceTypeNames,
					resolveType: (source: Slice | SharedSlice) => {
						if ("variation" in source) {
							return pascalCase(
								"Prismic",
								args.pluginOptions.typePrefix,
								source.slice_type,
								"Slice",
								source.variation,
							);
						} else {
							return pascalCase(
								"Prismic",
								args.pluginOptions.typePrefix,
								args.path.join(" "),
								source.slice_type,
							);
						}
					},
				});

				args.gatsbyNodeArgs.actions.createTypes(type);

				return {
					type: `[${type.config.name}!]!`,
				};
			} else {
				// If the Slice Zone does not contain any
				// choices, exclude the Slice Zone field from
				// the schema. Returning `undefined` here will
				// exclude the field in
				// `fieldMOdelsRecordToGraphQLType()`.
				return undefined;
			}
		}

		case CustomTypeModelFieldType.StructuredText: {
			const type = `${pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				"RichTextField",
			)}!`;

			if (
				args.model.config &&
				"single" in args.model.config &&
				args.model.config.single &&
				args.model.config.single
					.split(",")
					.every((blockType) => /^heading/.test(blockType))
			) {
				return {
					type,
					description: "A Title field.",
				};
			} else {
				return {
					type,
					description: "A Rich Text field.",
				};
			}
		}

		case CustomTypeModelFieldType.Text: {
			return {
				type: "String",
				description: "A Key Text field.",
				// TODO: Restore this resolver.
				resolve: (
					source,
					_args,
					_context,
					info,
				): KeyTextField<"filled"> | null => {
					const field = source[info.fieldName] as KeyTextField;

					if (isFilled.keyText(field)) {
						return field;
					} else {
						return null;
					}
				},
			};
		}

		case CustomTypeModelFieldType.Timestamp: {
			return {
				type: "Date",
				description: "A Timestamp field.",
				extensions: { dateformat: {} },
			};
		}

		case CustomTypeModelFieldType.Integration: {
			if (!args.model.config?.catalog) {
				throw new Error(
					fmtLog(
						args.pluginOptions.repositoryName,
						`Integration fields must have a catalog configured, but none was found for this field: ${args.path.join(
							".",
						)}`,
					),
				);
			}

			const type = args.gatsbyNodeArgs.schema.buildObjectType({
				name: pascalCase(
					"Prismic",
					args.pluginOptions.typePrefix,
					args.model.config.catalog,
					"IntegrationItem",
				),
				description: `An Integration Fields field connected to the \`${args.model.config.catalog}\` catalog.`,
				fields: {
					// At least one field must be defined to supress a graphql-compose error.
					id: "ID!",
				},
				interfaces: ["Node"],
				extensions: { infer: true },
			});

			args.gatsbyNodeArgs.actions.createTypes(type);

			return {
				type: type.config.name,
				description: `An Integration Fields field connected to the \`${args.model.config.catalog}\` catalog.`,
				extensions: { link: {} },
			};
		}

		default: {
			const dotPath = args.path.join(".");

			args.gatsbyNodeArgs.reporter.info(
				fmtLog(
					args.pluginOptions.repositoryName,
					`An unknown field type "${args.model.type}" was found at ${dotPath}. A generic JSON type will be used. You can manually override the type using Gatsby's createSchemaCustomization API in your site's gatsby-node.js.`,
				),
			);

			return {
				type: "JSON",
				description: `This field's type is unknown ("${args.model.type}"). A generic \`JSON\` type is used. You can manually override the type using Gatsby's [\`createSchemaCustomization\`](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/) Node API in your site's \`gatsby-node.js\`.`,
			};
		}
	}
};
