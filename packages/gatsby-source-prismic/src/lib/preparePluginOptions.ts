import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";
import * as prismicCustomTypes from "@prismicio/custom-types-client";
import * as gatsbyFs from "gatsby-source-filesystem";
import nodeFetch from "node-fetch";

import { UnpreparedPluginOptions, PluginOptions } from "../types";
import {
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_LANG,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from "../constants";

/**
 * Converts a Custom Type model to a mocked Custom Type API response object.
 * This is used as a way to ease migration from the `schemas` plugin option to
 * the `customTypeModels` plugin option.
 *
 * The `label`, `status`, and `repeatable` fields will **not** represent the
 * actual values from the Prismic repository. They will contain placeholder
 * values since that data is not available from just the Custom Type model.
 *
 * @param id - API ID of the Custom Type.
 * @param modelDefinition - Model for the Custom Type.
 *
 * @returns The Custom Type model as if it came from the
 */
const customTypeModelDefinitionToCustomTypeModel = (
	id: string,
	modelDefinition: prismicT.CustomTypeModelDefinition,
): prismicT.CustomTypeModel => ({
	id,
	json: modelDefinition,
	// The following values are treated as filler values since we don't have this
	// metadata. They do **not** accurately represent the Custom Type.
	label: id,
	status: true,
	repeatable: true,
});

/**
 * Merge arrays by performing a shallow equality check on an element's property.
 *
 * @param property - The property to compare.
 * @param a - The base array.
 * @param b - The priority array. Elements in this array take priority over
 *   equal items in `a`. Items are considered equal by comparing the value of
 *   the element's `property`.
 *
 * @returns An array containing elements from `a` and `b`.
 */
const shallowArrayMergeByProperty = <
	P extends string,
	R extends Record<P, unknown>,
>(
	property: P,
	a: R[],
	b: R[],
) => {
	return [
		...a.filter(
			(aElement) =>
				!b.some((bElement) =>
					Object.is(bElement[property], aElement[property]),
				),
		),
		...b,
	];
};

export const preparePluginOptions = async (
	unpreparedPluginOptions: UnpreparedPluginOptions,
): Promise<PluginOptions> => {
	const result: PluginOptions = {
		apiEndpoint: prismic.getEndpoint(unpreparedPluginOptions.repositoryName),
		imageImgixParams: DEFAULT_IMGIX_PARAMS,
		imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
		shouldDownloadFiles: {},
		createRemoteFileNode: gatsbyFs.createRemoteFileNode,
		transformFieldName: (fieldName: string) => fieldName.replace(/-/g, "_"),
		fetch: nodeFetch,
		customTypeModels: [],
		sharedSliceModels: [],
		lang: DEFAULT_LANG,
		...unpreparedPluginOptions,
	};

	// Support deprecated `schemas` plugin option containing Custom Type model
	// definitions.
	if (unpreparedPluginOptions.schemas) {
		const convertedModels = Object.keys(unpreparedPluginOptions.schemas)
			.map((id) => {
				if (unpreparedPluginOptions.schemas) {
					const modelDefinition = unpreparedPluginOptions.schemas[id];

					return customTypeModelDefinitionToCustomTypeModel(
						id,
						modelDefinition,
					);
				}
			})
			.filter((model): model is prismicT.CustomTypeModel => Boolean(model));

		// Models provided to `customTypeModels` take priority.
		result.customTypeModels = shallowArrayMergeByProperty(
			"id",
			convertedModels,
			result.customTypeModels,
		);
	}

	// Fetch models using the Custom Types API if a token is provided.
	if (unpreparedPluginOptions.customTypesApiToken) {
		const customTypesClient = prismicCustomTypes.createClient({
			repositoryName: unpreparedPluginOptions.repositoryName,
			token: unpreparedPluginOptions.customTypesApiToken,
			endpoint: unpreparedPluginOptions.customTypesApiEndpoint,
			fetch: result.fetch,
		});

		const customTypeModels = await customTypesClient.getAllCustomTypes();
		const sharedSliceModels = await customTypesClient.getAllSharedSlices();

		// Models provided to `customTypeModels` take priority.
		result.customTypeModels = shallowArrayMergeByProperty(
			"id",
			customTypeModels,
			result.customTypeModels,
		);

		// Models provided to `sharedSliceModels` take priority.
		result.sharedSliceModels = shallowArrayMergeByProperty(
			"id",
			sharedSliceModels,
			result.sharedSliceModels,
		);
	}

	return result;
};
