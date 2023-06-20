import {
	AlternateLanguage,
	LinkField,
	LinkResolverFunction,
	LinkType,
	RichTextField,
	TitleField,
	asHTML,
	asLink,
	asText,
	isFilled,
} from "@prismicio/client";
import type {
	CreateSchemaCustomizationArgs,
	GatsbyGraphQLObjectType,
	GatsbyGraphQLUnionType,
} from "gatsby";

import { buildImageObjectType } from "../lib/buildImageObjectType";
import { buildImgixURLParamsInputObjectType } from "../lib/buildImgixURLParamsInputObjectType";
import { customTypeModelToGraphQLType } from "../lib/customTypeModelToGraphQLType";
import { getModelsCacheKey } from "../lib/getModelsCacheKey";
import { pascalCase } from "../lib/pascalCase";
import { resolveModels } from "../lib/resolveModels";
import { sharedSliceModelToGraphQLType } from "../lib/sharedSliceModelToGraphQLType";

import type { PluginOptions } from "../types";

import { GatsbyImageDataPlaceholderKind } from "../constants";

export const createSchemaCustomization = async <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TLinkResolverFunction extends LinkResolverFunction<any> = LinkResolverFunction,
>(
	args: CreateSchemaCustomizationArgs,
	options: PluginOptions<TLinkResolverFunction>,
): Promise<void> => {
	const { customTypeModels, sharedSliceModels } = await resolveModels({
		pluginOptions: options,
	});

	args.cache.set(
		getModelsCacheKey({ repositoryName: options.repositoryName }),
		{
			customTypeModels,
			sharedSliceModels,
		},
	);

	let customTypeTypes: GatsbyGraphQLObjectType[] = [];

	for (const customTypeModel of customTypeModels) {
		const type = customTypeModelToGraphQLType({
			model: customTypeModel,
			sharedSliceModels,
			pluginOptions: options,
			gatsbyNodeArgs: args,
		});

		customTypeTypes = [...customTypeTypes, type];
	}

	let sharedSliceTypes: GatsbyGraphQLUnionType[] = [];

	for (const sharedSliceModel of sharedSliceModels) {
		const type = sharedSliceModelToGraphQLType({
			model: sharedSliceModel,
			sharedSliceModels,
			pluginOptions: options,
			gatsbyNodeArgs: args,
		});

		sharedSliceTypes = [...sharedSliceTypes, type];
	}

	const sharedTypes = [
		args.schema.buildUnionType({
			name: pascalCase("Prismic", options.typePrefix, "AllDocumentTypes"),
			types: customTypeTypes.map((type) => type.config.name),
		}),
		args.schema.buildObjectType({
			name: pascalCase("Prismic", options.typePrefix, "AlternateLanguage"),
			description:
				"Metadata for alternate versions of a document in different languages.",
			fields: {
				id: {
					type: "ID!",
				},
				uid: {
					type: "String",
				},
				lang: {
					type: "String!",
				},
				type: {
					type: "String!",
				},
				url: {
					type: "String",
					description:
						"The URL of the Prismic document determined using the configured Route Resolvers or Link Resolver. If Route Resolvers or a Link Resolver is not given, this field is `null`.",
					resolve: async (
						source: AlternateLanguage,
						_args,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						ctx: any,
					) => {
						const node = await ctx.nodeModel.getNodeById({
							id: args.createNodeId(source.id),
							type: pascalCase("Prismic", options.typePrefix, source.type),
						});

						return asLink(node, { linkResolver: options.linkResolver });
					},
				},
				document: {
					type: `${pascalCase(
						"Prismic",
						options.typePrefix,
						"AllDocumentTypes",
					)}!`,
					resolve: (source: AlternateLanguage): string => {
						return args.createNodeId(source.id);
					},
					extensions: { link: {} },
				},
				raw: {
					type: "JSON!",
					resolve: (source: AlternateLanguage): AlternateLanguage => {
						return source;
					},
				},
			},
		}),
		args.schema.buildObjectType({
			name: pascalCase("Prismic", options.typePrefix, "EmbedField"),
			description: "oEmbed content from an oEmbed-enabled URL.",
			fields: {
				// At least one field must be defined to supress a graphql-compose warning.
				id: "ID!",
			},
			interfaces: ["Node"],
			extensions: { infer: true },
		}),
		args.schema.buildObjectType({
			name: "PrismicGeoPointField",
			description: "Geolocation coordinates.",
			fields: {
				latitude: {
					type: "Float",
					description: "The latitude value of the GeoPoint field.",
				},
				longitude: {
					type: "Float",
					description: "The longitude value of the GeoPoint field.",
				},
			},
		}),
		args.schema.buildScalarType({
			name: "PrismicRichText",
			description:
				"Text content with rich formatting capabilities used in Prismic documents.",
		}),
		args.schema.buildObjectType({
			name: pascalCase("Prismic", options.typePrefix, "RichTextField"),
			description: "Rich Text provided in various formats.",
			fields: {
				text: {
					type: "String",
					description: "The Rich Text value formatted as text.",
					resolve: (source: RichTextField | TitleField): string | null => {
						if (isFilled.richText(source)) {
							return asText(source);
						} else {
							return null;
						}
					},
				},
				html: {
					type: "String",
					description: "The Rich Text value formatted as HTML.",
					resolve: (source: RichTextField | TitleField): string | null => {
						if (isFilled.richText(source)) {
							return asHTML(source, {
								linkResolver: options.linkResolver,
								serializer: options.htmlSerializer,
							});
						} else {
							return null;
						}
					},
				},
				richText: {
					type: "PrismicRichText!",
					description: 'The Rich Text value in its "raw" form.',
					resolve: (
						source: RichTextField | TitleField,
					): RichTextField | TitleField => source,
				},
				// TODO: Remove in next major version.
				raw: {
					type: "PrismicRichText!",
					description: 'The Rich Text value in its "raw" form.',
					deprecationReason:
						"This field has been renamed to `richText`. The `richText` field has the same value the `raw` field.",
					resolve: (
						source: RichTextField | TitleField,
					): RichTextField | TitleField => source,
				},
			},
		}),
		args.schema.buildEnumType({
			name: "PrismicLinkType",
			description: "Types of a Prismic Link field value.",
			values: {
				Any: {
					description: "An unknown link type.",
				},
				Document: {
					description: "A link to a document in the Prismic repository.",
				},
				Media: {
					description: "A link to a file in the Prismic Media Library.",
				},
				Web: {
					description: "A link to the web.",
				},
			},
		}),
		args.schema.buildObjectType({
			name: pascalCase("Prismic", options.typePrefix, "LinkField"),
			description:
				"A link to the web, a document in the Prismic repository, or a file in the Prismic Media Library",
			fields: {
				link_type: {
					type: "PrismicLinkType",
					description: "The type of link for this field value.",
				},
				isBroken: {
					type: "Boolean",
					description: "Determines if the linked document exists.",
				},
				url: {
					type: "String",
					description:
						"The URL of the linked website, Prismic document, or file. If the field value is a Prismic document, the URL is determined using the configured Route Resolvers or Link Resolver. If Route Resolvers or a Link Resolver is not given, this field is `null`.",
					resolve: (source: LinkField): string | null => {
						if (isFilled.link(source)) {
							return asLink(source, { linkResolver: options.linkResolver });
						} else {
							return null;
						}
					},
				},
				target: {
					type: "String",
					description:
						'`_blank` if the field value is configured to "Open in a new window," `null` otherwise.',
				},
				size: {
					type: "Int",
					description: "The file size of the linked file.",
				},
				id: {
					type: "ID",
					description:
						"The ID of the selected Prismic document if the field links to a document.",
				},
				type: {
					type: "String",
					description:
						"The type of the selected Prismic document if the field links to a document.",
				},
				tags: {
					type: "[String!]",
					description:
						"The list of tags for the selected Prismic document if the field links to a document.",
				},
				lang: {
					type: "String",
					description:
						"The language of the selected Prismic document if the field links to a document.",
				},
				slug: {
					type: "String",
					description:
						"The slug of the selected Prismic document if the field links to a document.",
				},
				uid: {
					type: "String",
					description:
						"The UID of the selected Prismic document if the field links to a document that contains a UID field.",
				},
				document: {
					type: pascalCase("Prismic", options.typePrefix, "AllDocumentTypes"),
					description: "The Prismic document if the field links to a document.",
					resolve: (source: LinkField): string | null => {
						if (
							isFilled.link(source) &&
							source.link_type === LinkType.Document &&
							!source.isBroken
						) {
							return args.createNodeId(source.id);
						} else {
							return null;
						}
					},
					extensions: { link: {} },
				},
				localFile: {
					type: "File",
					description:
						"The locally download file if the field links to a media file and the field is configured to download locally.",
					extensions: { link: {} },
				},
				raw: {
					type: "JSON!",
					description:
						"**Do not use this field unless you know what you are doing**. The unprocessed field value returned from the Prismic REST API.",
				},
			},
		}),
		args.schema.buildInterfaceType({
			name: "PrismicSlice",
			description:
				"A collection of fields used in flexible content areas (called Slice Zones) of a Prismic document.",
			fields: {
				id: {
					type: "ID!",
				},
				slice_type: {
					type: "String!",
				},
				slice_label: {
					type: "String",
				},
			},
		}),
		args.schema.buildInterfaceType({
			name: "PrismicSharedSlice",
			description:
				"A collection of fields used in flexible content areas (called Slice Zones) of a Prismic document.",
			fields: {
				id: {
					type: "ID!",
				},
				slice_type: {
					type: "String!",
				},
				slice_label: {
					type: "String",
				},
				variation: {
					type: "String!",
				},
				version: {
					type: "String!",
				},
			},
			interfaces: ["PrismicSlice"],
		}),
		args.schema.buildObjectType({
			name: "PrismicImageFieldDimensions",
			description: "Width and height of an image.",
			fields: {
				width: {
					type: "Int!",
					description: "The image's width in pixels.",
				},
				height: {
					type: "Int!",
					description: "The image's height in pixels.",
				},
			},
		}),
		args.schema.buildInterfaceType({
			name: "PrismicImageFieldBase",
			description: "An Image field.",
			fields: {
				alt: {
					type: "String",
					description: "An alternative text for the image.",
				},
				copyright: {
					type: "String",
					description: "Copyright information for the image.",
				},
				dimensions: {
					type: "PrismicImageFieldDimensions",
					description: "The image's width and height.",
				},
				url: {
					type: "String",
					description: "The image's URL.",
				},
				gatsbyImageData: {
					type: "JSON",
					description: "`gatsby-plugin-image` image data.",
				},
				localFile: {
					type: "File",
					description:
						"The locally download image file if the field is configured to download locally.",
					extensions: { link: {} },
				},
			},
		}),
		buildImageObjectType({
			schema: args.schema,
			cache: args.cache,
			pluginOptions: options,
		}),
		args.schema.buildEnumType({
			name: "PrismicGatsbyImageDataPlaceholder",
			description:
				"The style of temporary image shown while the full image loads.",
			values: {
				BLURRED: {
					value: GatsbyImageDataPlaceholderKind.Blurred,
					description:
						"This generates a very low-resolution version of the source image and displays it as a blurred background.",
				},
				DOMINANT_COLOR: {
					value: GatsbyImageDataPlaceholderKind.DominantColor,
					description:
						"The default placeholder. This calculates the dominant color of the source image and uses it as a solid background color.",
				},
				NONE: {
					value: GatsbyImageDataPlaceholderKind.None,
					description:
						"No placeholder. You can use the background color option to set a static background if you wish.",
				},
			},
		}),
		buildImgixURLParamsInputObjectType({
			schema: args.schema,
		}),
	];

	for (const type of [
		...customTypeTypes,
		...sharedSliceTypes,
		...sharedTypes,
	]) {
		// Calling this function for each type individually, rather
		// than once with an array containing all types, is done for
		// easier testing. We can check if the action was called
		// without also handling the extra layer of an array.
		args.actions.createTypes(type);
	}

	const customTypeModelIDs = customTypeModels.map(
		(customTypeModel) => customTypeModel.id,
	);
	args.cache.set(
		`${options.repositoryName}:customTypeModelIDs`,
		customTypeModelIDs,
	);
};
