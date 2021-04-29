import chalk from 'chalk'

/**
 * Version of the gatsby-plugin-prismic-preview plugin. This version may be
 * displayed publicly to help debug errors.
 */
export const VERSION = '4.0.0'

/**
 * Prismic API document fields returned for image fields that are **not**
 * thumbnails.
 *
 * These fields are filtered out from the API response to extract the field's
 * thumbnails. The API includes thumbnails adjacent to these fields.
 */
export const PRISMIC_API_IMAGE_FIELDS = [
  'alt',
  'copyright',
  'dimensions',
  'url',
]

/**
 * Default value for the `toolbar` plugin option which determines which version
 * of the Prismic Toolbar to render.
 */
export const DEFAULT_TOOLBAR = 'new'

/**
 * Default value for the `promptForAccessToken` plugin option which determines
 * if an editor should be prompted for an access token if one has not already
 * been provided.
 */
export const DEFAULT_PROMPT_FOR_ACCESS_TOKEN = true

/**
 * Default page size for Prismic API query requests. This is the maximum allowed
 * page size to minimize the number of requests.
 */
export const QUERY_PAGE_SIZE = 100

/**
 * Template used to generate a hash for a collection of type paths.
 */
export const TYPE_PATHS_BASENAME_TEMPLATE = 'type-paths-store %s'

/**
 * Identifier used to store plugin options on `window` to pass to other parts
 * of the preview system.
 */
export const WINDOW_PLUGIN_OPTIONS_KEY =
  '__GATSBY_PLUGIN_PRISMIC_PREVIEWS_PLUGIN_OPTIONS__'

/**
 * Name of the locally stored Prismic repository access token.
 */
export const COOKIE_ACCESS_TOKEN_NAME =
  'gatsby-plugin-prismic-previews.%s.accessToken'

/**
 * Template used when reporting which includes a namespace.
 */
export const REPORTER_TEMPLATE = 'gatsby-plugin-prismic-previews(%s) - %s'

/**
 * Template used to report the location of the serialized type paths store.
 */
export const WROTE_TYPE_PATHS_TO_FS_MSG = 'Wrote type paths store to %s'

/**
 * Message used when type paths cannot be found for a repository.
 */
export const TYPE_PATHS_MISSING_NODE_MSG = `Type paths for this repository could not be found. Check that you have ${chalk.cyan(
  'gatsby-source-prismic',
)} configured with the same repository name and type prefix (if used) in ${chalk.cyan(
  'gatsby-node.js',
)}.`

/**
 * Message used when serialized type paths cannot be found for a repository.
 */
export const TYPE_PATHS_MISSING_BROWSER_MSG =
  'The type paths store for this repository could not be found.'

/**
 * Message used when a field does not match its expected type.
 */
export const FIELD_VALUE_TYPE_PATH_MISMATCH_MSG =
  'Field value does not match the type declared in its type path: %s'
