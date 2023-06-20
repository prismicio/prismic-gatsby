import { Buffer } from "buffer";
import type { GatsbyCache } from "gatsby";
import type {
	IGatsbyImageData,
	IGatsbyImageHelperArgs,
	ImageFormat,
} from "gatsby-plugin-image";
import {
	generateImageData,
	getLowResolutionImageURL,
} from "gatsby-plugin-image";
import type { ImgixURLParams } from "imgix-url-builder";
import { buildURL } from "imgix-url-builder";
import PQueue from "p-queue";
import { extname } from "path";

import { name as packageName } from "../../package.json";

import {
	DEFAULT_IMGIX_PARAMS,
	GatsbyImageDataLayoutKind,
	GatsbyImageDataPlaceholderKind,
} from "../constants";

const imgixRequestQueue = new PQueue({ concurrency: 5 });

export const generateImageSource: IGatsbyImageHelperArgs["generateImageSource"] =
	(sourceUrl, width, height, format, _fit, options?: GatsbyImageDataArgs) => {
		const imgixParams: ImgixURLParams = {
			...DEFAULT_IMGIX_PARAMS,
			...options?.imgixParams,
			w: width,
			h: height,
		};

		if (format && format !== "auto") {
			imgixParams.fm = format;
		}

		return {
			src: buildURL(sourceUrl, imgixParams),
			width,
			height,
			format,
		};
	};

type FetchBase64ImageConfig = {
	url: string;
	cache: GatsbyCache;
};

const fetchBase64Image = async (
	config: FetchBase64ImageConfig,
): Promise<string | undefined> => {
	const cacheKey = `base64___${config.url}`;
	const cacheValue: string | undefined = await config.cache.get(cacheKey);

	if (cacheValue) {
		return cacheValue;
	} else {
		const fetch = (await import("node-fetch")).default;
		const res = await imgixRequestQueue.add(async () => {
			return await fetch(config.url);
		});

		if (res) {
			const arrayBuffer = await res.arrayBuffer();
			const buffer = Buffer.from(new Uint8Array(arrayBuffer));
			const contentType = res.headers.get("content-type");
			const base64 = `data:${contentType};base64,${buffer.toString("base64")}`;

			config.cache.set(cacheKey, base64);

			return base64;
		}
	}
};

/**
 * The minimal data used when querying an image's pallete data using Imgix's
 * API.
 *
 * @see Imgix Color Pallete Extration: https://docs.imgix.com/apis/rendering/color-palette/palette
 */
export interface ImgixPalleteLike {
	colors: { hex: string }[];
	dominant_colors?: {
		vibrant?: { hex: string };
		muted?: { hex: string };
	};
}

/**
 * Metadata that defines an image. This data is used to resolve Gatsby image
 * objects.
 */
export interface ImageSource {
	/**
	 * The image's Imgix URL.
	 */
	url: string;

	/**
	 * The width of the image.
	 */
	width: number;

	/**
	 * The height of the image.
	 */
	height: number;
}

export type GatsbyImageDataArgs = {
	placeholder?: GatsbyImageDataPlaceholderKind;
	imgixParams?: ImgixURLParams;
	placeholderImgixParams?: ImgixURLParams;

	aspectRatio?: number;
	backgroundColor?: string;
	breakpoints?: number[];
	formats?: ImageFormat[];
	layout?: GatsbyImageDataLayoutKind;
	width?: number;
	height?: number;
	sizes?: string;
};

type ResolveGatsbyImageDataConfig = {
	cache: GatsbyCache;
	pluginName?: string;
	buildURL?: typeof buildURL;
};

export const resolveGatsbyImageData = async (
	image: ImageSource,
	options: GatsbyImageDataArgs = {},
	config: ResolveGatsbyImageDataConfig,
): Promise<IGatsbyImageData | null> => {
	const imageDataArgs: IGatsbyImageHelperArgs = {
		pluginName: config.pluginName || packageName,
		sourceMetadata: {
			width: image.width,
			height: image.height,
			format: "auto",
		},
		filename: image.url,
		generateImageSource,
		options,
		layout: options.layout,
		width: options.width,
		height: options.height,
		aspectRatio: options.aspectRatio,
		backgroundColor: options.backgroundColor,
		breakpoints: options.breakpoints,
		formats: options.formats,
		sizes: options.sizes,
	};

	const resolvedBuildURL = config.buildURL || buildURL;
	const placeholderURL = resolvedBuildURL(imageDataArgs.filename, {
		...DEFAULT_IMGIX_PARAMS,
		...options.imgixParams,
		...options.placeholderImgixParams,
	});

	if (options.placeholder === GatsbyImageDataPlaceholderKind.Blurred) {
		imageDataArgs.placeholderURL = await fetchBase64Image({
			url: getLowResolutionImageURL({
				...imageDataArgs,
				filename: placeholderURL,
			}),
			cache: config.cache,
		});
	}

	if (options.placeholder === GatsbyImageDataPlaceholderKind.DominantColor) {
		const cacheKey = `${GatsbyImageDataPlaceholderKind.DominantColor}___${placeholderURL}`;
		const cacheValue: string | undefined = await config.cache.get(cacheKey);

		if (cacheValue) {
			imageDataArgs.backgroundColor = cacheValue;
		} else {
			const fileExtension = extname(new URL(placeholderURL).pathname);

			// Imgix does not support `palette=json` for SVGs.
			if (fileExtension !== ".svg") {
				const palleteUrl = resolvedBuildURL(placeholderURL, {
					palette: "json",
					colors: 1,
				});
				const fetch = (await import("node-fetch")).default;
				const res = await imgixRequestQueue.add(async () => {
					return await fetch(palleteUrl);
				});

				if (res) {
					const json = (await res.json()) as ImgixPalleteLike;

					const dominantColor =
						json.dominant_colors?.muted?.hex ||
						json.dominant_colors?.vibrant?.hex ||
						json.colors[0].hex;

					config.cache.set(cacheKey, dominantColor);

					imageDataArgs.backgroundColor = dominantColor;
				}
			}
		}
	}

	return generateImageData(imageDataArgs);
};
