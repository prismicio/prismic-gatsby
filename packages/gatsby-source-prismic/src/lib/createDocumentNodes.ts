import type {
	CustomTypeModel,
	PrismicDocument,
	SharedSliceModel,
} from "@prismicio/client";
import { NodeInput, NodePluginArgs } from "gatsby";

import type { PluginOptions, PrismicDocumentForModel } from "../types";

import { fmtLog } from "./fmtLog";
import { normalizeDocument } from "./normalizeDocument";
import { pascalCase } from "./pascalCase";

type CreateDocumentNodesArgs = {
	documents: PrismicDocument[];
	customTypeModels: CustomTypeModel[];
	sharedSliceModels: SharedSliceModel[];
	gatsbyNodeArgs: NodePluginArgs;
	pluginOptions: PluginOptions;
};

export const createDocumentNodes = async (
	args: CreateDocumentNodesArgs,
): Promise<void> => {
	// A list of document types that we have already warned about not have
	// an accompanying Custom Type model. Documents of these types will not
	// be added to the Node store.
	const alreadyWarnedAboutMissingCustomTypeModels: string[] = [];

	await Promise.all(
		args.documents.map(async (document) => {
			const model = args.customTypeModels.find((customTypeModel) => {
				return customTypeModel.id === document.type;
			});

			if (model) {
				const normalizedDocument = await normalizeDocument({
					document: document as PrismicDocumentForModel<typeof model>,
					model,
					pluginOptions: args.pluginOptions,
					gatsbyNodeArgs: args.gatsbyNodeArgs,
					sharedSliceModels: args.sharedSliceModels,
				});

				const node: NodeInput = {
					...normalizedDocument,
					id: args.gatsbyNodeArgs.createNodeId(document.id),
					prismicId: document.id,
					raw: document,
					internal: {
						type: pascalCase(
							"Prismic",
							args.pluginOptions.typePrefix,
							document.type,
						),
						contentDigest: args.gatsbyNodeArgs.createContentDigest(document),
					},
				};

				args.gatsbyNodeArgs.actions.createNode(node);
			} else {
				if (
					!alreadyWarnedAboutMissingCustomTypeModels.includes(document.type)
				) {
					alreadyWarnedAboutMissingCustomTypeModels.push(document.type);
					args.gatsbyNodeArgs.reporter.warn(
						fmtLog(
							args.pluginOptions.repositoryName,
							`A "${document.type}" Custom Type model was not provided to the plugin. All documents of this type will not be queryable.`,
						),
					);
				}
			}
		}),
	);
};
