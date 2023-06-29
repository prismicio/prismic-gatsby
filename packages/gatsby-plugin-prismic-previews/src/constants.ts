import type { ImgixURLParams } from "imgix-url-builder";

export const PUBLIC_MODELS_FILE_NAME_SEED_CACHE_KEY =
	"publicModelsFileNameSeed";

/**
 * Default Imgix parameters applied to all images.
 */
export const DEFAULT_IMGIX_PARAMS: ImgixURLParams = {
	fit: "max",
};
