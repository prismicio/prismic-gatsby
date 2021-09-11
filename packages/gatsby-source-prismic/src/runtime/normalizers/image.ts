import * as prismicT from "@prismicio/types";
import * as gatsbyImage from "gatsby-image";
import * as gatsbyPluginImage from "gatsby-plugin-image";
import * as gatsbyImgix from "gatsby-plugin-imgix-lite";

import { sanitizeImageURL } from "../../lib/sanitizeImageURL";

import { NormalizeConfig, NormalizerDependencies } from "../types";
import { PRISMIC_API_IMAGE_FIELDS } from "../../constants";

const getURLSearchParams = (url: string): Record<string, string> => {
	const urlInstance = new URL(url);
	const result: Record<string, string> = {};

	for (const [key, value] of urlInstance.searchParams.entries()) {
		result[key] = value;
	}

	return result;
};

export const isImageField = (value: unknown): value is prismicT.ImageField => {
	// Unfortunately, we can't check for specific properties here since it's
	// possible for the object to be empty if an image was never set.
	return typeof value === "object" && value !== null;
};

export type NormalizeImageConfig<
	Value extends prismicT.ImageField = prismicT.ImageField,
> = NormalizeConfig<Value> &
	Pick<
		NormalizerDependencies,
		"imageImgixParams" | "imagePlaceholderImgixParams"
	>;

type NormalizedImageBase<Value extends prismicT.ImageFieldImage> =
	Value extends prismicT.FilledImageFieldImage
		? Value & {
				fixed: gatsbyImage.FixedObject;
				fluid: gatsbyImage.FluidObject;
				gatsbyImageData: gatsbyPluginImage.IGatsbyImageData;
				localFile: {
					publicURL: Value["url"];
					childImageSharp: {
						fixed: gatsbyImage.FixedObject;
						fluid: gatsbyImage.FluidObject;
						gatsbyImageData: gatsbyPluginImage.IGatsbyImageData;
					};
				};
		  }
		: Value extends prismicT.EmptyImageFieldImage
		? Value & {
				fixed: null;
				fluid: null;
				gatsbyImageData: null;
				localFile: null;
		  }
		: never;

export type NormalizedImageValue<Value extends prismicT.ImageField> =
	NormalizedImageBase<Value> & {
		thumbnails: Record<string, NormalizedImageBase<prismicT.ImageFieldImage>>;
	};

type BuildImageFieldConfig<Value extends prismicT.ImageFieldImage> = {
	value: Value;
	imageImgixParams: gatsbyImgix.ImgixParams;
	imagePlaceholderImgixParams: gatsbyImgix.ImgixParams;
};

const buildImageField = <Value extends prismicT.ImageFieldImage>(
	config: BuildImageFieldConfig<Value>,
): NormalizedImageBase<Value> => {
	if (config.value.url) {
		const imgixParams = {
			...getURLSearchParams(config.value.url),
			...config.imageImgixParams,
		};

		const url = new URL(config.value.url);

		const normalizedURL = sanitizeImageURL(config.value.url);

		const populatedUrl = new URL(url.toString());
		for (const paramKey in imgixParams) {
			populatedUrl.searchParams.set(
				paramKey,
				String(imgixParams[paramKey as keyof typeof imgixParams]),
			);
		}

		const aspectRatio =
			config.value.dimensions.width / config.value.dimensions.height;

		const fixed = gatsbyImgix.buildFixedImageData(normalizedURL, {
			...config.imageImgixParams,
			w: 400,
			h: 400 / aspectRatio,
		});

		const fluid = gatsbyImgix.buildFluidImageData(normalizedURL, {
			...config.imageImgixParams,
			ar: `${aspectRatio}:1`,
		});

		const gatsbyImageData = gatsbyImgix.getGatsbyImageData({
			src: normalizedURL,
			sourceWidth: config.value.dimensions.width,
			sourceHeight: config.value.dimensions.height,
			imgixParams: config.imageImgixParams,
		});

		return {
			url: sanitizeImageURL(populatedUrl.toString()),
			alt: config.value.alt,
			copyright: config.value.copyright,
			dimensions: config.value.dimensions,
			fixed,
			fluid,
			gatsbyImageData,
			localFile: {
				publicURL: config.value.url,
				childImageSharp: {
					fixed,
					fluid,
					gatsbyImageData,
				},
			},
		} as NormalizedImageBase<Value>;
	} else {
		return {
			url: null,
			alt: null,
			copyright: null,
			dimensions: null,
			fixed: null,
			gatsbyImageData: null,
			fluid: null,
			localFile: null,
		} as NormalizedImageBase<Value>;
	}
};

export const image = <Value extends prismicT.ImageField>(
	config: NormalizeImageConfig<Value>,
): NormalizedImageValue<Value> => {
	const result = {
		...buildImageField({
			value: config.value,
			imageImgixParams: config.imageImgixParams,
			imagePlaceholderImgixParams: config.imagePlaceholderImgixParams,
		}),
		thumbnails: {},
	} as NormalizedImageValue<Value>;

	const thumbnailNames = Object.keys(config.value).filter(
		(key) => !PRISMIC_API_IMAGE_FIELDS.includes(key),
	);

	for (const thumbnailName of thumbnailNames) {
		result.thumbnails[thumbnailName as keyof typeof result.thumbnails] =
			buildImageField({
				value: config.value[thumbnailName],
				imageImgixParams: config.imageImgixParams,
				imagePlaceholderImgixParams: config.imagePlaceholderImgixParams,
			});
	}

	return result;
};
