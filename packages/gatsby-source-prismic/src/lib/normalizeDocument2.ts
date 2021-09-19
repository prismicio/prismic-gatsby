import * as prismicT from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";
import * as gatsby from "gatsby";
import * as gatsbyFs from "gatsby-source-filesystem";
import * as cc from "change-case";

import { PluginOptions } from "../types";

import { dotPath } from "./dotPath";
import { traversePrismicValue } from "./traversePrismicValue";

const pascalCase = (input: string): string =>
	cc.pascalCase(input, { transform: cc.pascalCaseTransformMerge });

type NormalizedImageFieldImage<_Value> =
	| (prismicT.FilledImageFieldImage & { localFile: string })
	| (prismicT.EmptyImageFieldImage & { localFile: null });

type NormalizedImageField<Value> =
	| (prismicT.FilledImageFieldImage & { localFile: string } & Record<
				string,
				NormalizedImageFieldImage<Value>
			>)
	| (prismicT.EmptyImageFieldImage & { localFile: null } & Record<
				string,
				NormalizedImageFieldImage<Value>
			>);

type NormalizedLinkField<Value> = Value extends prismicT.FilledLinkToMediaField
	? prismicT.FilledLinkToMediaField & { localFile: string }
	: prismicT.LinkField & { localFile: null };

type NormalizedIntegrationFieldsField = string | null;

type NormalizedEmbedField = string | null;

type NormalizedStructuredTextField<
	Value extends prismicT.TitleField | prismicT.RichTextField,
> = {
	text: string;
	html: string;
	richText: Value;
	raw: Value;
};

type CreateRemoteFileNodeConfig<Field> = {
	url: string;
	path: string[];
	field: Field;
	gatsbyContext: gatsby.NodePluginArgs;
	pluginOptions: PluginOptions;
	createRemoteFileNode: typeof gatsbyFs.createRemoteFileNode;
};

const createRemoteFileNode = async <
	Field extends prismicT.ImageFieldImage | prismicT.LinkToMediaField,
>(
	config: CreateRemoteFileNodeConfig<Field>,
): Promise<gatsbyFs.FileSystemNode | null> => {
	const predicateOrBooleanForPath =
		config.pluginOptions.shouldDownloadFiles[dotPath(config.path)];

	const shouldDownloadFile =
		typeof predicateOrBooleanForPath === "function"
			? predicateOrBooleanForPath(config.field)
			: predicateOrBooleanForPath || false;

	if (shouldDownloadFile) {
		return await gatsbyFs.createRemoteFileNode({
			url: config.url,
			store: config.gatsbyContext.store,
			cache: config.gatsbyContext.cache,
			createNode: config.gatsbyContext.actions.createNode,
			createNodeId: config.gatsbyContext.createNodeId,
			reporter: config.gatsbyContext.reporter,
		});
	} else {
		return null;
	}
};

type NormalizeDocumentConfig = {
	model: prismicT.CustomTypeModel;
	value: prismicT.PrismicDocument;
	gatsbyContext: gatsby.NodePluginArgs;
	pluginOptions: PluginOptions;
	createRemoteFileNode: typeof gatsbyFs.createRemoteFileNode;
};

export const normalizeDocument = (config: NormalizeDocumentConfig) => {
	return traversePrismicValue({
		model: config.model,
		value: config.value,
		path: [config.model.id],
		visitors: {
			embed: async ({ value }): Promise<NormalizedEmbedField> => {
				if ("embed_url" in value && value.embed_url) {
					const node = {
						...value,
						id: config.gatsbyContext.createNodeId(
							`Prismic ${config.pluginOptions.typePrefix} Embed ${value.embed_url}`,
						),
						internal: {
							type: pascalCase(
								`Prismic ${config.pluginOptions.typePrefix} EmbedType`,
							),
							contentDigest: config.gatsbyContext.createContentDigest(value),
						},
					};

					config.gatsbyContext.actions.createNode(node);

					return node.id;
				} else {
					return null;
				}
			},

			integrationFields: async ({
				model,
				value,
			}): Promise<NormalizedIntegrationFieldsField> => {
				if (value) {
					const node = {
						...value,
						id: config.gatsbyContext.createNodeId(
							`Prismic ${config.pluginOptions.typePrefix} IntegrationFields ${model.config.catalog} ${value.id}`,
						),
						prismicId: value.id,
						internal: {
							type: pascalCase(
								`Prismic ${config.pluginOptions.typePrefix} ${model.config.catalog} IntegrationFields`,
							),
							contentDigest: config.gatsbyContext.createContentDigest(value),
						},
					};

					config.gatsbyContext.actions.createNode(node);

					return node.id;
				} else {
					return null;
				}
			},

			link: async ({
				value,
				path,
			}): Promise<NormalizedLinkField<typeof value>> => {
				let fileNode: gatsbyFs.FileSystemNode | null = null;

				if (
					value.link_type === prismicT.LinkType.Media &&
					"url" in value &&
					value.url
				) {
					fileNode = await createRemoteFileNode({
						url: value.url,
						path,
						field: value,
						pluginOptions: config.pluginOptions,
						gatsbyContext: config.gatsbyContext,
						createRemoteFileNode: config.createRemoteFileNode,
					});
				}

				return {
					...value,
					localFile: fileNode?.id || null,
				} as NormalizedLinkField<typeof value>;
			},

			image: async ({
				model,
				value,
				path,
			}): Promise<NormalizedImageField<typeof value>> => {
				const thumbnails: Record<
					string,
					NormalizedImageFieldImage<typeof value>
				> = {};

				const thumbnailKeys = model.config.thumbnails.map(
					(thumbnailModel) => thumbnailModel.name,
				);

				for (const thumbnailKey of thumbnailKeys) {
					const thumbnail = value[thumbnailKey];

					const fileNode = thumbnail.url
						? await createRemoteFileNode({
								url: thumbnail.url,
								path: [...path, thumbnailKey],
								field: thumbnail,
								pluginOptions: config.pluginOptions,
								gatsbyContext: config.gatsbyContext,
								createRemoteFileNode: config.createRemoteFileNode,
						  })
						: null;

					thumbnails[thumbnailKey] = {
						...value[thumbnailKey],
						localFile: fileNode?.id || null,
					} as NormalizedImageFieldImage<typeof value>;
				}

				const fileNode = value.url
					? await createRemoteFileNode({
							url: value.url,
							path,
							field: value,
							pluginOptions: config.pluginOptions,
							gatsbyContext: config.gatsbyContext,
							createRemoteFileNode: config.createRemoteFileNode,
					  })
					: null;

				return {
					...value,
					...thumbnails,
					localFile: fileNode?.id || null,
				} as NormalizedImageField<typeof value>;
			},
			structuredText: async ({
				value,
			}): Promise<NormalizedStructuredTextField<typeof value>> => {
				return {
					text: prismicH.asText(value),
					html: prismicH.asHTML(
						value,
						config.pluginOptions.linkResolver,
						config.pluginOptions.htmlSerializer,
					),
					richText: value,
					raw: value,
				};
			},
		},
	});
};
