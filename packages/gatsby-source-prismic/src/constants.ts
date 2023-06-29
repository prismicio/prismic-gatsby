import type { ImgixURLParams } from "imgix-url-builder";

/**
 * The namespace used for all Imgix GraphQL types.
 */
export const IMGIX_GRAPHQL_TYPE_NAMESPACE = "Imgix";

/**
 * Default Imgix parameters applied to all images.
 */
export const DEFAULT_IMGIX_PARAMS: ImgixURLParams = {
	fit: "max",
};

/**
 * Default Imgix parameters applied to all placeholder images.
 */
export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS: ImgixURLParams = {
	blur: 15,
	q: 20,
};

/**
 * Root node field used to compare static data with preview data. If values are
 * equal, the preview node can be treated as an updated version of the static
 * node.
 *
 * This is an internal-use-only field used by `gatsby-plugin-prismic-previews`.
 */
export const PREVIEWABLE_FIELD_NAME = "_previewable";

/**
 * Gatsby Image placeholder kinds.
 *
 * @see Gatsby Image plugin documentation: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#placeholder
 */
export enum GatsbyImageDataPlaceholderKind {
	Blurred = "blurred",
	DominantColor = "dominantColor",
	None = "none",
}

/**
 * Gatsby Image layout kinds.
 *
 * @see Gatsby Image plugin documentation: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image/#layout
 */
export enum GatsbyImageDataLayoutKind {
	Constrained = "constrained",
	Fixed = "fixed",
	FullWidth = "fullWidth",
}
