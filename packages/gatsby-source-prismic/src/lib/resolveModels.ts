import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/client";

import type { PluginOptions } from "../types";

type GetModelsArgs = {
	pluginOptions: PluginOptions;
};

/**
 * Collects all Custom Type and Shared Slice models. Models may come from plugin
 * options or the Custom Types API.
 *
 * @param args - Arguments for `resolveModels`.
 *
 * @returns A collection of Custom Type and Shared Slice models.
 */
export const resolveModels = async (
	args: GetModelsArgs,
): Promise<{
	customTypeModels: CustomTypeModel[];
	sharedSliceModels: SharedSliceModel[];
}> => {
	// These "keyed" records store the resulting models. By using the
	// models' IDs as keys, we can easily manage precedence by overwriting
	// a ID's model.
	const keyedCustomTypeModels: Record<string, CustomTypeModel> = {};
	const keyedSharedSliceModels: Record<string, SharedSliceModel> = {};

	// If a Custom Type API token is provided, fetch all Custom Type and
	// Shared Slice models. They will be used as the lowest priority
	// models. If any models are given locally as a plugin option, they
	// will take priority over models fetched from the Custom Types API.
	if (args.pluginOptions.customTypesApiToken) {
		const client = prismicCustomTypesClient.createClient({
			repositoryName: args.pluginOptions.repositoryName,
			token: args.pluginOptions.customTypesApiToken,
			fetch: args.pluginOptions.fetch || (await import("node-fetch")).default,
			endpoint: args.pluginOptions.customTypesApiEndpoint,
		});

		const [customTypeModels, sharedSliceModels] = await Promise.all([
			client.getAllCustomTypes(),
			client.getAllSharedSlices(),
		]);

		for (const customTypeModel of customTypeModels) {
			keyedCustomTypeModels[customTypeModel.id] = customTypeModel;
		}

		for (const sharedSliceModel of sharedSliceModels) {
			keyedSharedSliceModels[sharedSliceModel.id] = sharedSliceModel;
		}
	}

	// If Custom Type definitions are provided, add them to the result.
	// They must be converted from a JSON definition to a full Custom Type
	// model (Model = Metadata + JSON Definition).
	if (args.pluginOptions.schemas) {
		for (const id in args.pluginOptions.schemas) {
			const customTypeModel: CustomTypeModel = {
				id,
				json: args.pluginOptions.schemas[id],
				// The following values are "fake". They are
				// not part of the given definition so we must
				// fill them in to promote the type to a Custom
				// Type model.
				label: "label",
				status: true,
				repeatable: true,
			};

			keyedCustomTypeModels[customTypeModel.id] = customTypeModel;
		}
	}

	// If Custom Type models are provided, add them to the result. They
	// take priority over anything that was added before this block.
	if (args.pluginOptions.customTypeModels) {
		for (const customTypeModel of args.pluginOptions.customTypeModels) {
			keyedCustomTypeModels[customTypeModel.id] = customTypeModel;
		}
	}

	// If Shared Slice models are provided, add them to the result. They
	// take priority over anything that was added before this block.
	if (args.pluginOptions.sharedSliceModels) {
		for (const sharedSliceModel of args.pluginOptions.sharedSliceModels) {
			keyedSharedSliceModels[sharedSliceModel.id] = sharedSliceModel;
		}
	}

	return {
		customTypeModels: Object.values(keyedCustomTypeModels),
		sharedSliceModels: Object.values(keyedSharedSliceModels),
	};
};
