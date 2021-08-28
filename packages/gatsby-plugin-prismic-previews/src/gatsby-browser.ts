/**
 * This file exports Gatsby's Browser APIs for this plugin.
 *
 * Prefer writing implementations in separate modules rather than poluting this file.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

export { onClientEntry } from "./on-client-entry";
// TODO: Temporarily disabling automatic provider injection as it doesn't seem to work
// export { wrapRootElement } from './wrap-root-element'
