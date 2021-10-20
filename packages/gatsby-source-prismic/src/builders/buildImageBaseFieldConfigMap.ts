import * as gqlc from "graphql-compose";
import * as gatsbyImgix from "gatsby-plugin-imgix-lite/node";
import * as prismicT from "@prismicio/types";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as O from "fp-ts/Option";
import * as S from "fp-ts/Semigroup";
import * as A from "fp-ts/Array";
import * as R from "fp-ts/Record";
import { constNull, pipe } from "fp-ts/function";

import { name as packageName } from "../../package.json";

import { sanitizeImageURL } from "../lib/sanitizeImageURL";

import { Dependencies } from "../types";
import { IMGIX_TYPE_PREFIX } from "../constants";

/**
 * The minimum required GraphQL argument properties for an `@imgix/gatsby` field.
 */
interface ImgixGatsbyFieldArgsLike {
	imgixParams?: gatsbyImgix.ImgixParams;
}

/**
 * Modifies an `@imgix/gatsby` GraphQL field config to retain existing Imgix
 * parameters set on the source URL.
 *
 * This is needed if the source URL contains parameters like `rect` (crops an
 * image). Without this config enhancer, the `rect` parameter would be removed.
 *
 * @param fieldConfig - GraphQL field config object to be enhanced.
 *
 * @returns `fieldConfig` with the ability to retain existing Imgix parameters
 *   on the source URL.
 */
const withExistingURLImgixParameters = <
	TContext,
	TArgs extends ImgixGatsbyFieldArgsLike,
>(
	fieldConfig: gqlc.ObjectTypeComposerFieldConfigAsObjectDefinition<
		prismicT.ImageFieldImage,
		TContext,
		TArgs
	>,
): typeof fieldConfig => ({
	...fieldConfig,
	resolve: (source, args, ...rest) =>
		pipe(
			O.Do,
			O.bind("url", () =>
				O.fromNullable(source.url ? new URL(source.url) : null),
			),
			O.bind("existingImgixParams", (scope) =>
				pipe(
					[...scope.url.searchParams.entries()],
					R.fromFoldable(S.last<string>(), A.Foldable),
					O.of,
				),
			),
			O.map((scope) =>
				fieldConfig.resolve?.(
					source,
					{
						...args,
						imgixParams: {
							...scope.existingImgixParams,
							...args.imgixParams,
						},
					},
					...rest,
				),
			),
			O.getOrElseW(constNull),
		),
});

const generateImageSource: gatsbyImgix.GenerateImageSource<prismicT.ImageFieldImage> =
	(image) => {
		if (image.url != null) {
			return {
				url: sanitizeImageURL(image.url),
				width: image.dimensions.width,
				height: image.dimensions.height,
			};
		} else {
			return null;
		}
	};

/**
 * Builds a GraphQL field configuration object to be used as part of another
 * Image field GraphQL configuration object. For example, this base
 * configuration object could be added to a config for the thumbnails of an Image field.
 */
export const buildImageBaseFieldConfigMap: RTE.ReaderTaskEither<
	Dependencies,
	never,
	gqlc.ObjectTypeComposerFieldConfigMapDefinition<
		prismicT.ImageFieldImage,
		undefined
	>
> = pipe(
	RTE.ask<Dependencies>(),
	RTE.bind("urlField", (scope) =>
		RTE.right(
			withExistingURLImgixParameters(
				// @ts-expect-error - complex type resolution issue
				gatsbyImgix.buildUrlFieldConfig({
					namespace: IMGIX_TYPE_PREFIX,
					defaultImgixParams: scope.pluginOptions.imageImgixParams,
					generateImageSource,
				}),
			),
		),
	),
	RTE.bind("fixedField", (scope) =>
		RTE.right(
			withExistingURLImgixParameters(
				// @ts-expect-error - complex type resolution issue
				gatsbyImgix.buildFixedFieldConfig({
					namespace: IMGIX_TYPE_PREFIX,
					defaultImgixParams: scope.pluginOptions.imageImgixParams,
					defaultPlaceholderImgixParams:
						scope.pluginOptions.imagePlaceholderImgixParams,
					generateImageSource,
				}),
			),
		),
	),
	RTE.bind("fluidField", (scope) =>
		RTE.right(
			withExistingURLImgixParameters(
				// @ts-expect-error - complex type resolution issue
				gatsbyImgix.buildFluidFieldConfig({
					namespace: IMGIX_TYPE_PREFIX,
					defaultImgixParams: scope.pluginOptions.imageImgixParams,
					defaultPlaceholderImgixParams:
						scope.pluginOptions.imagePlaceholderImgixParams,
					generateImageSource,
				}),
			),
		),
	),
	RTE.bind("gatsbyImageDataField", (scope) =>
		RTE.right(
			withExistingURLImgixParameters(
				// @ts-expect-error - complex type resolution issue
				gatsbyImgix.buildGatsbyImageDataFieldConfig({
					namespace: IMGIX_TYPE_PREFIX,
					cache: scope.cache,
					pluginName: packageName,
					defaultImgixParams: scope.pluginOptions.imageImgixParams,
					defaultPlaceholderImgixParams:
						scope.pluginOptions.imagePlaceholderImgixParams,
					generateImageSource,
				}),
			),
		),
	),
	RTE.map((scope) => ({
		alt: "String",
		copyright: "String",
		dimensions: scope.globalNodeHelpers.createTypeName("ImageDimensionsType"),
		url: scope.urlField,
		fixed: scope.fixedField,
		fluid: scope.fluidField,
		gatsbyImageData: scope.gatsbyImageDataField,
		localFile: {
			type: "File",
			extensions: { link: {} },
		},
	})),
);
