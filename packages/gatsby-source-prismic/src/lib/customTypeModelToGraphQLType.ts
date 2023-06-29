import {
	CustomTypeModel,
	CustomTypeModelFieldType,
	CustomTypeModelTab,
	SharedSliceModel,
	asLink,
} from "@prismicio/client";
import type { GatsbyGraphQLObjectType, NodePluginArgs } from "gatsby";

import type { PluginOptions, PrismicDocumentNodeInput } from "../types";

import { PREVIEWABLE_FIELD_NAME } from "../constants";

import { fieldModelsRecordToGraphQLType } from "./fieldModelsRecordToGraphQLType";
import { pascalCase } from "./pascalCase";

type CustomTypeModelToGraphQLTypeArgs = {
	model: CustomTypeModel;
	sharedSliceModels: SharedSliceModel[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const customTypeModelToGraphQLType = (
	args: CustomTypeModelToGraphQLTypeArgs,
): GatsbyGraphQLObjectType => {
	const type = args.gatsbyNodeArgs.schema.buildObjectType({
		name: pascalCase("Prismic", args.pluginOptions.typePrefix, args.model.id),
		description: `A ${args.model.label} document from Prismic.`,
		fields: {
			prismicId: {
				type: "ID!",
				description:
					"The identifier for the Prismic document. It is guaranteed to be unique within all documents of all types from the same Prismic repository.",
			},
			alternate_languages: {
				type: `[${pascalCase(
					"Prismic",
					args.pluginOptions.typePrefix,
					"AlternateLanguage",
				)}!]!`,
				description:
					"Alternate versions of the document in different languages.",
			},
			first_publication_date: {
				type: "Date!",
				description: "The timestamp at which the document was first published.",
				extensions: { dateformat: {} },
			},
			last_publication_date: {
				type: "Date!",
				description: "The timestamp at which the document was last published.",
				extensions: { dateformat: {} },
			},
			href: {
				type: "String!",
				description:
					"The URL to fetch this document's JSON value from the Prismic REST API.",
			},
			lang: {
				type: "String!",
				description: "The language of the Prismic document.",
			},
			tags: {
				type: "[String!]!",
				description: "Tags associated with the Prismic document.",
			},
			type: {
				type: "String!",
				description: "The type of the Prismic document.",
			},
			url: {
				type: "String",
				description:
					"The URL of the Prismic document determined using the configured Route Resolvers or Link Resolver. If Route Resolvers or a Link Resolver is not given, this field is `null`.",
				resolve: (source: PrismicDocumentNodeInput) =>
					asLink(source, args.pluginOptions.linkResolver),
			},
			raw: {
				type: "JSON!",
				description:
					"**Do not use this field unless you know what you are doing**. The unprocessed Prismic document value returned from the Prismic REST API.",
			},
			[PREVIEWABLE_FIELD_NAME]: {
				type: "ID!",
				description:
					"Query this field to enable preview support on this node. Requires `gatsby-plugin-prismic-preview` integrated in your app to enable previews.",
				resolve: (source: PrismicDocumentNodeInput) => source.prismicId,
			},
		},
		interfaces: ["Node"],
		extensions: { infer: false },
	});

	const { uid: uidFieldModel, ...dataFieldModels }: CustomTypeModelTab =
		Object.assign({}, ...Object.values(args.model.json));

	if (uidFieldModel && uidFieldModel.type === CustomTypeModelFieldType.UID) {
		if (type.config.fields) {
			type.config.fields.uid = {
				type: "String!",
				description:
					"The unique identifier for the Prismic document. It is guaranteed to be unique within all documents of the same type from the same Prismic repository.",
			};
		}
	}

	if (Object.keys(dataFieldModels).length > 0) {
		const dataType = fieldModelsRecordToGraphQLType({
			path: [args.model.id, "data"],
			models: dataFieldModels,
			sharedSliceModels: args.sharedSliceModels,
			gatsbyNodeArgs: args.gatsbyNodeArgs,
			pluginOptions: args.pluginOptions,
		});

		args.gatsbyNodeArgs.actions.createTypes(dataType);

		if (type.config.fields) {
			type.config.fields.data = {
				type: `${dataType.config.name}!`,
				description: "Content for the document.",
			};
			type.config.fields.dataRaw = {
				type: "JSON!",
				description:
					"**Do not use this field unless you know what you are doing**. The unprocessed `data` property of the Prismic document. Querying individual fields via GraphQL is much preferred.",
				resolve: (source: PrismicDocumentNodeInput) => source.raw.data,
			};
		}
	}

	return type;
};
