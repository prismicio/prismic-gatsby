import * as gatsby from "gatsby";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import * as prismicCustomTypes from "@prismicio/custom-types-client";
import fetch from "node-fetch";

import { preparePluginOptions } from "./lib/preparePluginOptions";
import { sprintf } from "./lib/sprintf";

import { UnpreparedPluginOptions } from "./types";
import {
	FORBIDDEN_ACCESS_WITHOUT_ACCESS_TOKEN,
	FORBIDDEN_ACCESS_WITH_ACCESS_TOKEN,
	FORBIDDEN_CUSTOM_TYPES_API_ACCESS,
	MISSING_SCHEMAS_MSG,
	MISSING_SCHEMA_MSG,
	NON_EXISTENT_RELEASE_WITHOUT_ACCESS_TOKEN_MSG,
	NON_EXISTENT_RELEASE_WITH_ACCESS_TOKEN_MSG,
} from "./constants";

export const pluginOptionsSchema: NonNullable<
	gatsby.GatsbyNode["pluginOptionsSchema"]
> = (args) => {
	const { Joi } = args;

	return (
		Joi.object({
			repositoryName: Joi.string().required(),
			accessToken: Joi.string(),
			apiEndpoint: Joi.string(),
			customTypesApiToken: Joi.string(),
			customTypesApiEndpoint: Joi.string(),
			releaseID: Joi.string(),
			fetchLinks: Joi.array().items(Joi.string().required()),
			graphQuery: Joi.string(),
			lang: Joi.string(),
			linkResolver: Joi.function(),
			htmlSerializer: Joi.alternatives(
				Joi.object(
					Object.keys(prismicH).reduce((acc, key) => {
						acc[key] = Joi.function();

						return acc;
					}, {} as Record<string, ReturnType<typeof Joi.function>>),
				),
				Joi.function(),
			),
			schemas: Joi.object(),
			customTypeModels: Joi.array().items(
				Joi.object({
					id: Joi.string().required(),
					json: Joi.object().required(),
				}).unknown(),
			),
			sharedSliceModels: Joi.array().items(
				Joi.object({
					id: Joi.string().required(),
					variations: Joi.array()
						.items(
							Joi.object({
								id: Joi.string().required(),
								primary: Joi.object(),
								items: Joi.object(),
							}).unknown(),
						)
						.required(),
				}).unknown(),
			),
			imageImgixParams: Joi.object(),
			imagePlaceholderImgixParams: Joi.object(),
			typePrefix: Joi.string(),
			webhookSecret: Joi.string(),
			shouldDownloadFiles: Joi.object().pattern(
				Joi.string(),
				Joi.alternatives(Joi.boolean(), Joi.function()),
			),
			createRemoteFileNode: Joi.function(),
			transformFieldName: Joi.function(),
			fetch: Joi.function(),
		})
			.or("customTypesApiToken", "customTypeModels", "schemas")
			.oxor("fetchLinks", "graphQuery")
			// Check access to the repository and, if given, the Release
			.external(async (unpreparedPluginOptions: UnpreparedPluginOptions) => {
				const endpoint =
					unpreparedPluginOptions.apiEndpoint ||
					prismic.getEndpoint(unpreparedPluginOptions.repositoryName);
				const client = prismic.createClient(endpoint, {
					fetch: unpreparedPluginOptions.fetch || fetch,
					accessToken: unpreparedPluginOptions.accessToken,
				});

				if (unpreparedPluginOptions.releaseID) {
					client.queryContentFromReleaseByID(unpreparedPluginOptions.releaseID);
				}

				try {
					await client.getRepository();
				} catch (error) {
					if (error instanceof Error) {
						let message = error.message;

						if (error instanceof prismic.ForbiddenError) {
							message = unpreparedPluginOptions.accessToken
								? FORBIDDEN_ACCESS_WITH_ACCESS_TOKEN
								: FORBIDDEN_ACCESS_WITHOUT_ACCESS_TOKEN;
						}

						if (/ref could not be found/i.test(error.message)) {
							message = unpreparedPluginOptions.accessToken
								? sprintf(
										NON_EXISTENT_RELEASE_WITH_ACCESS_TOKEN_MSG,
										unpreparedPluginOptions.repositoryName,
								  )
								: sprintf(
										NON_EXISTENT_RELEASE_WITHOUT_ACCESS_TOKEN_MSG,
										unpreparedPluginOptions.repositoryName,
								  );
						}

						throw new Joi.ValidationError(message, [{ message }], error.name);
					}
				}
			})
			// Check access to Custom Types API if a token is given
			.external(async (unpreparedPluginOptions: UnpreparedPluginOptions) => {
				if (unpreparedPluginOptions.customTypesApiToken) {
					const client = prismicCustomTypes.createClient({
						repositoryName: unpreparedPluginOptions.repositoryName,
						endpoint: unpreparedPluginOptions.customTypesApiEndpoint,
						token: unpreparedPluginOptions.customTypesApiToken,
						fetch: unpreparedPluginOptions.fetch || fetch,
					});

					try {
						await client.getAll();
					} catch (error) {
						if (error instanceof Error) {
							let message = error.message;

							if (error instanceof prismicCustomTypes.ForbiddenError) {
								message = FORBIDDEN_CUSTOM_TYPES_API_ACCESS;
							}

							throw new Joi.ValidationError(message, [{ message }], error.name);
						}
					}
				}
			})
			// Check if all Custom Type models have been provided
			.external(async (unpreparedPluginOptions: UnpreparedPluginOptions) => {
				const pluginOptions = await preparePluginOptions(
					unpreparedPluginOptions,
				);

				const client = prismic.createClient(pluginOptions.apiEndpoint, {
					fetch: pluginOptions.fetch,
					accessToken: pluginOptions.accessToken,
				});

				const repository = await client.getRepository();
				const missingCustomTypeIds = Object.keys(repository.types).filter(
					(customTypeId) => {
						return !pluginOptions.customTypeModels.some(
							(customTypeModel) => customTypeModel.id === customTypeId,
						);
					},
				);

				if (missingCustomTypeIds.length > 0) {
					throw new Joi.ValidationError(
						MISSING_SCHEMAS_MSG,
						missingCustomTypeIds.map((id) => ({
							message: sprintf(MISSING_SCHEMA_MSG, id),
						})),
						pluginOptions.customTypeModels.map(
							(customTypeModel) => customTypeModel.id,
						),
					);
				}
			})
	);
};
