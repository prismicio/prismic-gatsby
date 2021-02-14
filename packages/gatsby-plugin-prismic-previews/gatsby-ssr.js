// This file must export the individual Gatsby SSR APIs in order for Gatsby to
// detect them. Compare this to the export method employed in
// `gatsby-browser.js`.
const gatsbySSR = require('./dist/gatsby-ssr')

exports.onRenderBody = gatsbySSR.onRenderBody
