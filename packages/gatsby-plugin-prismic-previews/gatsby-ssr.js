/**
 * APIs exported from `gatsby-ssr.ts` must be re-exported manually. Gatsby will
 * not detect the exports if the module is re-exported as a whole.
 */

const gatsbySSR = require('./dist/gatsby-ssr')

exports.onRenderBody = gatsbySSR.onRenderBody
