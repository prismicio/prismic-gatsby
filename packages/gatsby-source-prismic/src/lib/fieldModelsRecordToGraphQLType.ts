import type { CustomTypeModelField, SharedSliceModel } from "@prismicio/client";
import type { GatsbyGraphQLType, NodePluginArgs } from "gatsby";

import type { PluginOptions } from "../types";

import { defaultTransformFieldName } from "./defaultTransformFieldName";
import { fieldModelToGraphQLConfig } from "./fieldModelToGraphQLConfig";
import { pascalCase } from "./pascalCase";

type FieldModelsRecordToGraphQLTypeArgs = {
	path: string[];
	models: Record<string, CustomTypeModelField>;
	sharedSliceModels: SharedSliceModel[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const fieldModelsRecordToGraphQLType = (
	args: FieldModelsRecordToGraphQLTypeArgs,
): GatsbyGraphQLType => {
	const type = args.gatsbyNodeArgs.schema.buildObjectType({
		name: pascalCase(
			"Prismic",
			args.pluginOptions.typePrefix,
			args.path.join(" "),
		),
		fields: {},
	});

	for (const fieldName in args.models) {
		const model = args.models[fieldName];
		const transformedFieldName = args.pluginOptions.transformFieldName
			? args.pluginOptions.transformFieldName(fieldName)
			: defaultTransformFieldName(fieldName);

		if (type.config.fields) {
			const graphQLConfig = fieldModelToGraphQLConfig({
				...args,
				model,
				path: [...args.path, fieldName],
			});

			// Only include fields where
			// `fieldModelToGraphQLConfig()` returned a config. In
			// some cases, the field model does not map to a valid
			// GraphQL type, forcing us to exclude the field.
			if (graphQLConfig) {
				type.config.fields[transformedFieldName] = graphQLConfig;
			}
		}
	}

	return type;
};
