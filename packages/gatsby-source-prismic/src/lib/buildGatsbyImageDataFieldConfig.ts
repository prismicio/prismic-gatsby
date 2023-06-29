import { ImageFieldImage, isFilled } from "@prismicio/client";
import type { GatsbyCache } from "gatsby";
import { getGatsbyImageFieldConfig } from "gatsby-plugin-image/graphql-utils";
import type { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";

import type { PluginOptions } from "../types";

import {
	DEFAULT_IMGIX_PARAMS,
	GatsbyImageDataPlaceholderKind,
} from "../constants";

import {
	GatsbyImageDataArgs,
	resolveGatsbyImageData,
} from "./resolveGatsbyImageData.server";

export type BuildGatsbyImageDataFieldConfigConfig = {
	cache: GatsbyCache;
	pluginOptions: PluginOptions;
};

export const buildGatsbyImageDataFieldConfig = <TContext>(
	config: BuildGatsbyImageDataFieldConfigConfig,
): ObjectTypeComposerFieldConfigAsObjectDefinition<
	ImageFieldImage,
	TContext,
	GatsbyImageDataArgs
> => {
	const fieldConfig = getGatsbyImageFieldConfig<
		ImageFieldImage,
		TContext,
		GatsbyImageDataArgs
	>(async (source, args) => {
		if (isFilled.imageThumbnail(source)) {
			return resolveGatsbyImageData(
				{
					url: source.url,
					width: source.dimensions.width,
					height: source.dimensions.height,
				},
				{
					...args,
					imgixParams: {
						...DEFAULT_IMGIX_PARAMS,
						...config.pluginOptions.imageImgixParams,
						...args.imgixParams,
					},
					placeholderImgixParams: {
						...DEFAULT_IMGIX_PARAMS,
						...config.pluginOptions.imageImgixParams,
						...config.pluginOptions.imagePlaceholderImgixParams,
						...args.placeholderImgixParams,
					},
				},
				{
					cache: config.cache,
					pluginName: "gatsby-source-prismic",
				},
			);
		} else {
			return null;
		}
	}) as ObjectTypeComposerFieldConfigAsObjectDefinition<
		ImageFieldImage,
		TContext,
		GatsbyImageDataArgs
	>;

	// We need to set this separately since the above type cast raises the field
	// config to a graphql-compose definition. This allows us to reference types
	// by name, which is needed for the arguments.
	fieldConfig.args = {
		...(fieldConfig.args as NonNullable<typeof fieldConfig.args>),
		placeholder: {
			type: "PrismicGatsbyImageDataPlaceholder",
			defaultValue: GatsbyImageDataPlaceholderKind.DominantColor,
		},
		imgixParams: {
			type: "PrismicImgixURLParams",
		},
		placeholderImgixParams: {
			type: "PrismicImgixURLParams",
		},
	};

	// @ts-expect-error - outputPixelDensities is not supported in
	// `gatsby-source-prismic` since it is not natively supported in
	// `gatsby-plugin-image`'s `generateImageData()` function.
	//
	// If you are familiar with `outputPixelDensities` and would like to
	// implement it, please submit a PR!
	delete fieldConfig.args.outputPixelDensities;

	// `getGatsbyImageFieldConfig` returns a "JSON!" type. This is undesired when
	// the source does not contain a value (i.e. null). Here, we are manually
	// overriding the type to be nullable.
	fieldConfig.type = "JSON";

	return fieldConfig;
};
