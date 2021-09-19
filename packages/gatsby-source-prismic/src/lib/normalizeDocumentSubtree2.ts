import * as prismicT from "@prismicio/types";
import * as gatsby from "gatsby";
import * as gatsbyFs from "gatsby-source-filesystem";
import * as cc from "change-case";

import { PluginOptions } from "../types";

import { dotPath } from "./dotPath";

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

type VisitorArgs<Model, Value> = {
	model: Model;
	value: Value;
	path: string[];
};

type Visitor<Model, Value> = (
	args: VisitorArgs<Model, Value>,
) => Promise<unknown>;

type TraversePrismicValueConfig<Model, Value> = {
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

type TraversedPrismicValue<Value> = unknown;

const traversePrismicValue = <Value>(
	config: TraversePrismicValueConfig<Value>,
): TraversedPrismicValue<Value> => {};

type CreateRemoteFileNodeConfig<Field> = {
	url: string;
	path: string[];
	field: Field;
	gatsbyContext: gatsby.NodePluginArgs;
	pluginOptions: PluginOptions;
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

type NormalizeDocumentSubtreeConfig = {
	model: unknown;
	value: unknown;
	path: string[];
	gatsbyContext: gatsby.NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const normalizeDocumentSubtree = (
	config: NormalizeDocumentSubtreeConfig,
) => {
	return traversePrismicValue({
		model: config.model,
		value: config.value,
		path: config.path,
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
					  })
					: null;

				return {
					...value,
					...thumbnails,
					localFile: fileNode?.id || null,
				} as NormalizedImageField<typeof value>;
			},
		},
	});
};
