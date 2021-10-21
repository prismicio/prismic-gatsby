/**
 * APIs exported from `gatsby-ssr.ts` must be re-exported manually. Gatsby will
 * not detect the exports if the module is re-exported as a whole.
 */

import * as gatsbySSR from "./dist/gatsby-ssr";

export const onRenderBody = gatsbySSR.onRenderBody;
export const wrapRootElement = gatsbySSR.wrapRootElement;
