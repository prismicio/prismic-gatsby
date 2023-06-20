import type { PluginOptionsSchemaArgs } from "gatsby";
import type { ObjectSchema } from "gatsby-plugin-utils";

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
		lang: Joi.string(),
		fetchLinks: Joi.array().items(Joi.string()),
		graphQuery: Joi.string(),
		predicates: Joi.alternatives(Joi.string(), Joi.array().items(Joi.string())),

		typePrefix: Joi.string(),

		imageImgixParams: Joi.object().pattern(Joi.string(), Joi.any()),
		imagePlaceholderImgixParams: Joi.object().pattern(Joi.string(), Joi.any()),
	}).oxor("fetchLinks", "graphQuery");
};
