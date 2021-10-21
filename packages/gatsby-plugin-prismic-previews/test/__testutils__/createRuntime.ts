import * as gatsbyPrismic from "gatsby-source-prismic";

import { PluginOptions, PrismicRepositoryConfig } from "../../src";

export const createRuntime = (
	pluginOptions: PluginOptions,
	repositoryConfig?: PrismicRepositoryConfig,
): gatsbyPrismic.Runtime => {
	return gatsbyPrismic.createRuntime({
		typePrefix: pluginOptions.typePrefix,
		imageImgixParams: pluginOptions.imageImgixParams,
		imagePlaceholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
		linkResolver: repositoryConfig?.linkResolver,
		htmlSerializer: repositoryConfig?.htmlSerializer,
		transformFieldName: repositoryConfig?.transformFieldName,
	});
};
