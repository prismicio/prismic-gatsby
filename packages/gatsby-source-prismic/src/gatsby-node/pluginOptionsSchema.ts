// TODO: Validate that all Shared Slices referenced in all Custom Type's Slice Zones are provided.
//
// This is necessary because we will be blindly referencing Shared Slice types within Slice Zones.
import * as prismic from "@prismicio/client";
import * as prismicCustomTypesClient from "@prismicio/custom-types-client";
import type { PluginOptionsSchemaArgs } from "gatsby";
import type { ObjectSchema } from "gatsby-plugin-utils";

import type { PluginOptions } from "../types";

export const pluginOptionsSchema = ({
	Joi,
}: PluginOptionsSchemaArgs): ObjectSchema => {
	return Joi.object({
		repositoryName: Joi.string().required(),
		accessToken: Joi.string().allow(""),
		apiEndpoint: Joi.string(),
		routes: Joi.array().items(
			Joi.object({
				type: Joi.string().required(),
				uid: Joi.string(),
				lang: Joi.string(),
				path: Joi.string().required(),
				resolvers: Joi.object().pattern(Joi.string(), Joi.string().required()),
			}).required(),
		),
		linkResolver: Joi.function().arity(1),
		htmlSerializer: Joi.alternatives(
			Joi.object().pattern(
				Joi.allow(...Object.keys(prismic.Element)),
				Joi.function(),
			),
			Joi.function(),
		),
		lang: Joi.string(),
		fetchLinks: Joi.array().items(Joi.string()),
		graphQuery: Joi.string(),
		predicates: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())),

		releaseID: Joi.string(),
		releaseLabel: Joi.string(),

		typePrefix: Joi.string(),

		customTypesApiToken: Joi.string(),
		customTypesApiEndpoint: Joi.string(),
		schemas: Joi.object().pattern(Joi.string(), Joi.object().required()),
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

		imageImgixParams: Joi.object().pattern(Joi.string(), Joi.any()),
		imagePlaceholderImgixParams: Joi.object().pattern(Joi.string(), Joi.any()),

		transformFieldName: Joi.function().arity(1),
		shouldDownloadFiles: Joi.alternatives(
			Joi.boolean(),
			Joi.function().arity(1),
			Joi.object().pattern(
				Joi.string(),
				Joi.alternatives(Joi.boolean(), Joi.function().arity(1)),
			),
		),

		webhookSecret: Joi.string(),

		fetch: Joi.function(),
	})
		.or("customTypesApiToken", "customTypeModels", "schemas")
		.oxor("fetchLinks", "graphQuery")
		.oxor("releaseID", "releaseLabel")
		.external(async (options: Omit<PluginOptions, "plugins">) => {
			const client = prismic.createClient(
				options.apiEndpoint || options.repositoryName,
				{
					accessToken: options.accessToken,
					fetch: options.fetch || (await import("node-fetch")).default,
				},
			);

			let repository: prismic.Repository;

			// Check access to the Prismic repository.
			try {
				repository = await client.getRepository();
			} catch (error) {
				if (error instanceof prismic.NotFoundError) {
					throw new Joi.ValidationError(
						"repositoryName",
						[
							{
								message: `Could not access the "${options.repositoryName}" Prismic repository. Check that the \`repositoryName\` option is correct and try again.`,
							},
						],
						options,
					);
				}

				if (error instanceof prismic.ForbiddenError) {
					if (options.accessToken) {
						throw new Joi.ValidationError(
							"accessToken",
							[
								{
									message: `The provided accessToken for the "${options.repositoryName}" repository is incorrect. Check that the \`accessToken\` option is correct and try again.`,
								},
							],
							options,
						);
					} else {
						throw new Joi.ValidationError(
							"accessToken",
							[
								{
									message: `An access token is required for the "${options.repositoryName}" Prismic repository, but one was not given. Check that the \`accessToken\` option is correct and try again.`,
								},
							],
							options,
						);
					}
				}

				throw error;
			}

			// Check that the Release exists (if the plugin is
			// configured to query from one).
			if (options.releaseID || options.releaseLabel) {
				if (options.releaseID) {
					const ref = repository.refs.find(
						(ref) => ref.id === options.releaseID,
					);

					if (!ref) {
						if (options.accessToken) {
							throw new Joi.ValidationError(
								"releaseID",
								[
									{
										message: `A Release with the ID "${options.releaseID}" could not be found. Check that the \`releaseID\` option is correct and try again. Also check that the access token has access to Releases.`,
									},
								],
								options,
							);
						} else {
							throw new Joi.ValidationError(
								"releaseID",
								[
									{
										message: `A Release with the ID "${options.releaseID}" could not be found. Check that the \`releaseID\` option is correct and try again. You may also need to provide an access token to query Releases.`,
									},
								],
								options,
							);
						}
					}
				} else if (options.releaseLabel) {
					const ref = repository.refs.find(
						(ref) => ref.label === options.releaseLabel,
					);

					if (!ref) {
						if (options.accessToken) {
							throw new Joi.ValidationError(
								"releaseLabel",
								[
									{
										message: `A Release with the label "${options.releaseLabel}" could not be found. Check that the \`releaseLabel\` option is correct and try again. Also check that the access token has access to Releases.`,
									},
								],
								options,
							);
						} else {
							throw new Joi.ValidationError(
								"releaseLabel",
								[
									{
										message: `A Release with the label "${options.releaseLabel}" could not be found. Check that the \`releaseLabel\` option is correct and try again. You may also need to provide an access token to query Releases.`,
									},
								],
								options,
							);
						}
					}
				}
			}

			// Check access to the Custom Types API (if the plugin
			// is configured to fetch models from it).
			if (options.customTypesApiToken) {
				const client = prismicCustomTypesClient.createClient({
					repositoryName: options.repositoryName,
					endpoint: options.customTypesApiEndpoint,
					token: options.customTypesApiToken,
					fetch: options.fetch || (await import("node-fetch")).default,
				});

				try {
					await client.getAllCustomTypes();
				} catch (error) {
					if (error instanceof prismicCustomTypesClient.ForbiddenError) {
						throw new Joi.ValidationError(
							"customTypesApiToken",
							[
								{
									message: `The provided Custom Types API token is incorrect. Check that the \`customTypesApiToken\` option is correct and try again.`,
								},
							],
							options,
						);
					}

					throw error;
				}
			}
		});
};
