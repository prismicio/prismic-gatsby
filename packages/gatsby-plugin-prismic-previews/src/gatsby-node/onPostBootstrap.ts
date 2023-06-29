import * as path from "path";
import type {
	CustomTypeModel,
	PrismicDocument,
	SharedSliceModel,
} from "@prismicio/client";
import type { Node, ParentSpanPluginArgs } from "gatsby";
import { createMutex } from "gatsby-core-utils/mutex";

import { getPublicModelsFileName } from "../lib/getPublicModelsFileName";
import { pascalCase } from "../lib/pascalCase";

import { PluginOptions } from "../types";

import * as fs from "fs/promises";

const isCustomTypeModelIDs = (input: unknown): input is string[] => {
	return (
		Array.isArray(input) &&
		input.every((element) => typeof element === "string")
	);
};

type PrismicDocumentNodeLike = Node & {
	prismicId: string;
	raw: PrismicDocument;
};

export const onPostBootstrap = async (
	args: ParentSpanPluginArgs,
	options: PluginOptions,
): Promise<void> => {
	const gatsbySourcePrismicCache = args.getCache("gatsby-source-prismic");

	const customTypeModelIDs = await gatsbySourcePrismicCache.get(
		`${options.repositoryName}:customTypeModelIDs`,
	);
	if (!isCustomTypeModelIDs(customTypeModelIDs)) {
		throw new Error(
			"Did not find Custom Type model IDs from gatsby-source-prismic.",
		);
	}

	const nodes: PrismicDocumentNodeLike[] = [];

	for (const customTypeModelID of customTypeModelIDs) {
		const nodesForType = args.getNodesByType(
			pascalCase("Prismic", options.typePrefix, customTypeModelID),
		) as PrismicDocumentNodeLike[];

		nodes.push(...nodesForType);
	}

	const mutex = createMutex(
		`gatsby-plugin-prismic-previews:write-nodes:${options.repositoryName}`,
	);

	await mutex.acquire();

	// Write models
	{
		const fileName = await getPublicModelsFileName(args.cache);
		const filePath = path.join("public", "static", fileName);

		let contents: Record<
			string,
			{
				customTypeModels: CustomTypeModel[];
				sharedSliceModels: SharedSliceModel[];
			}
		> = {};
		try {
			const rawExistingContents = await fs.readFile(filePath, "utf8");
			contents = JSON.parse(rawExistingContents);
		} catch {
			// noop
		}

		const models: {
			customTypeModels: CustomTypeModel[];
			sharedSliceModels: SharedSliceModel[];
		} = await gatsbySourcePrismicCache.get(`${options.repositoryName}:models`);

		contents[options.repositoryName] = models;

		await fs.writeFile(filePath, JSON.stringify(contents));
	}

	await mutex.release();
};
