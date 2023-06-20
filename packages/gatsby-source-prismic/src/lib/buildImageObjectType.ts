import { ImageFieldImage, isFilled } from "@prismicio/client";
import type {
	GatsbyCache,
	GatsbyGraphQLObjectType,
	NodePluginSchema,
} from "gatsby";
import type { ImgixURLParams } from "imgix-url-builder";
import { buildURL } from "imgix-url-builder";

import { PluginOptions } from "../types";

import { DEFAULT_IMGIX_PARAMS } from "../constants";

import { buildGatsbyImageDataFieldConfig } from "./buildGatsbyImageDataFieldConfig";
import { pascalCase } from "./pascalCase";

type BuildImageObjectTypeConfig = {
	schema: NodePluginSchema;
	cache: GatsbyCache;
	pluginOptions: PluginOptions;
};

export const buildImageObjectType = (
	config: BuildImageObjectTypeConfig,
): GatsbyGraphQLObjectType => {
	return config.schema.buildObjectType({
		name: pascalCase("Prismic", config.pluginOptions.typePrefix, "ImageField"),
		description: "An Image field.",
		fields: {
			alt: {
				type: "String",
				description: "An alternative text for the image.",
			},
			copyright: {
				type: "String",
				description: "Copyright information for the image.",
			},
			dimensions: {
				type: "PrismicImageFieldDimensions",
				description: "The image's width and height.",
			},
			url: {
				type: "String",
				description: "The image's URL.",
				args: {
					imgixParams: {
						type: "PrismicImgixURLParams",
						description:
							"Parameters to modify the image output using Imgix's URL API. To learn more, see: https://docs.imgix.com/apis/rendering",
					},
				},
				resolve: (
					source: ImageFieldImage,
					args: { imgixParams?: ImgixURLParams },
				): string | null => {
					if (isFilled.imageThumbnail(source)) {
						return buildURL(source.url, {
							...DEFAULT_IMGIX_PARAMS,
							...config.pluginOptions.imageImgixParams,
							...args.imgixParams,
						});
					} else {
						return null;
					}
				},
			},
			gatsbyImageData: buildGatsbyImageDataFieldConfig({
				cache: config.cache,
				pluginOptions: config.pluginOptions,
			}),
			localFile: {
				type: "File",
				description:
					"The locally download image file if the field is configured to download locally.",
				extensions: { link: {} },
			},
		},
		interfaces: ["PrismicImageFieldBase"],
	});
};
