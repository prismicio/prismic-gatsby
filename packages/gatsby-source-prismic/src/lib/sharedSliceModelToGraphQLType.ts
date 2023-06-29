import type { SharedSlice, SharedSliceModel } from "@prismicio/client";
import type { GatsbyGraphQLUnionType, NodePluginArgs } from "gatsby";

import type { PluginOptions } from "../types";

import { fieldModelsRecordToGraphQLType } from "./fieldModelsRecordToGraphQLType";
import { pascalCase } from "./pascalCase";

type SharedSliceModelToGraphQLTypeArgs = {
	model: SharedSliceModel;
	sharedSliceModels: SharedSliceModel[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const sharedSliceModelToGraphQLType = (
	args: SharedSliceModelToGraphQLTypeArgs,
): GatsbyGraphQLUnionType => {
	let variationTypeNames: string[] = [];

	for (const variation of args.model.variations) {
		const type = args.gatsbyNodeArgs.schema.buildObjectType({
			name: pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				args.model.id,
				"Slice",
				variation.id,
			),
			description: args.model.description,
			fields: {
				id: {
					type: "ID!",
					resolve: (source: SharedSlice): string => {
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
				version: {
					type: "String!",
				},
				variation: {
					type: "String!",
				},
			},
			interfaces: ["PrismicSlice", "PrismicSharedSlice"],
		});

		if (variation.primary && Object.keys(variation.primary).length > 0) {
			const primaryType = fieldModelsRecordToGraphQLType({
				...args,
				path: [args.model.id, variation.id, "primary"],
				models: variation.primary,
			});
			primaryType.config.name = pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				args.model.id,
				"Slice",
				variation.id,
				"Primary",
			);

			args.gatsbyNodeArgs.actions.createTypes(primaryType);

			if (type.config.fields) {
				type.config.fields.primary = {
					type: `${primaryType.config.name}!`,
				};
			}
		}

		if (variation.items && Object.keys(variation.items).length > 0) {
			const itemType = fieldModelsRecordToGraphQLType({
				...args,
				path: [args.model.id, variation.id, "items"],
				models: variation.items,
			});
			itemType.config.name = pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				args.model.id,
				"Slice",
				variation.id,
				"Item",
			);

			args.gatsbyNodeArgs.actions.createTypes(itemType);

			if (type.config.fields) {
				type.config.fields.items = {
					type: `[${itemType.config.name}!]!`,
				};
			}
		}

		args.gatsbyNodeArgs.actions.createTypes(type);

		variationTypeNames = [...variationTypeNames, type.config.name];
	}

	const type = args.gatsbyNodeArgs.schema.buildUnionType({
		name: pascalCase(
			"Prismic",
			args.pluginOptions.typePrefix,
			args.model.id,
			"Slice",
		),
		types: variationTypeNames,
		description: args.model.description,
		resolveType: (source: SharedSlice) => {
			return pascalCase(
				"Prismic",
				args.pluginOptions.typePrefix,
				source.slice_type,
				"Slice",
				source.variation,
			);
		},
	});

	return type;
};
