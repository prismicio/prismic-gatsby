/**
 * Name of the plugin used to identify Nodes owned by this plugin.
 *
 * Note: This should always be in sync with package.json's `name` field.
 */
export const PLUGIN_NAME = "gatsby-source-prismic";

/**
 * Global prefix used for all GraphQL types and, where necessary, fields.
 */
export const GLOBAL_TYPE_PREFIX = "Prismic";

/**
 * Default endpoint used to fetch custom type JSON schemas from Prismic's Custom Type API.
 *
 * @see https://prismic.io/docs/technologies/custom-types-api
 */
export const DEFAULT_CUSTOM_TYPES_API_ENDPOINT =
	"https://customtypes.prismic.io/customtypes";

/**
 * Prismic API document fields returned for image fields that are **not** thumbnails.
 *
 * These fields are filtered out from the API response to extract the field's
 * thumbnails. The API includes thumbnails adjacent to these fields.
 */
export const PRISMIC_API_IMAGE_FIELDS = [
	"alt",
	"copyright",
	"dimensions",
	"url",
];

/**
 * Default Imgix URL parameters for `gatsby-plugin-image` fields.
 *
 * These defaults provide a good balance between image quality and filesize.
 *
 * @see https://docs.imgix.com/apis/rendering
 */
export const DEFAULT_IMGIX_PARAMS = {
	auto: "compress,format",

	// The following values are not included by Prismic's URLs by default.
	fit: "max",
} as const;

/**
 * Default Imgix URL parameters for `gatsby-plugin-image` placeholder images.
 *
 * These defaults provide a good balance between image quality and filesize.
 * They are merged with the `imageImgixParams` plugin option.
 *
 * @see https://docs.imgix.com/apis/rendering
 */
export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS = {
	w: 100,

	// Makes the image appear less pixelated when stretched to large sizes.
	//
	// TODO: This value can be removed if `gatsby-plugin-image` implements
	// CSS-based blurring.
	blur: 15,
} as const;

/**
 * Default Prismic language option used when fetching documents. The current
 * default fetches all languages.
 *
 * @see https://prismic.io/docs/technologies/query-by-language-rest-api
 */
export const DEFAULT_LANG = "*";

/**
 * Format used for all plugin reporting. Includes the plugin's name and the
 * instance's repository name (helpful when multiple repositories are configured).
 */
export const REPORTER_TEMPLATE = `gatsby-source-prismic(%s) - %s`;

/**
 * Root node field used to compare static data with preview data. If values are
 * equal, the preview node can be treated as an updated version of the static node.
 *
 * This is an internal-use-only field used by `gatsby-plugin-prismic-previews`.
 */
export const PREVIEWABLE_NODE_ID_FIELD = "_previewable";

/**
 * Message displayed to the user when a webhook's secret does not match the
 * secret configured in the site's `gatsby-config.js`.
 */
export const WEBHOOK_SECRET_MISMATCH_MSG =
	"A webhook was received, but the webhook secret did not match the webhook secret provided in the plugin options. If this is unexpected, verify that the `webhookSecret` plugin option matches the webhook secret in your Prismic repository.";

/**
 * Message displayed to the user when a `test-trigger` webhook is received.
 */
export const WEBHOOK_TEST_TRIGGER_SUCCESS_MSG =
	"Success! Received a test trigger webhook. When changes to your content are saved, Gatsby will automatically fetch the changes.";

/**
 * Message displayed to the user when a missing custom type schema is detected.
 */
export const MISSING_SCHEMAS_MSG =
	"JSON schemas for all custom types are required";

/**
 * Format used to inform the user of a missing schema.
 */
export const MISSING_SCHEMA_MSG =
	'JSON model for "%s" is missing. If the Custom Type is no longer in use, you may provide "{}" as the JSON model.';

export const FORBIDDEN_ACCESS_WITHOUT_ACCESS_TOKEN =
	"Unable to access the Prismic repository. Check the repository name. If the repository is secured, provide an access token.";

export const FORBIDDEN_ACCESS_WITH_ACCESS_TOKEN =
	"Unable to access the Prismic repository. Check that the correct repository name and access token are provided.";

export const FORBIDDEN_CUSTOM_TYPES_API_ACCESS =
	"Unable to access the Prismic Custom Types API. Check the customTypesApiToken option.";

export const NON_EXISTENT_RELEASE_WITH_ACCESS_TOKEN_MSG =
	'The given Release ID ("%s") could not be found. If the Release ID is correct, check that your access token has permission to view Releases.';

export const NON_EXISTENT_RELEASE_WITHOUT_ACCESS_TOKEN_MSG =
	'The given Release ID ("%s") could not be found. If the Release ID is correct, you may need to provide an access token with permission to view Releases.';
