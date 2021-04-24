/**
 * This file contains the Link Resolver for your Prismic repository's content.
 * The Link Resolver function converts a Prismic document to a URL within your
 * app. It will be used throughout your app to resolve document links and
 * support editor previews.
 *
 * Customize the `linkResolver` function to match your app's URL structure.
 *
 * This file must be written in CommonJS format (i.e. `exports.linkResolver`
 * instead of `export const linkResolver`) since it will be imported in your
 * app's `gatsby-config.js` file.
 */

/**
 * The Link Resolver used for the Prismic repository. This function converts a
 * Prismic document to a URL within your app. It is used throughout your app to
 * resolve document links and support editor previews.
 *
 * @see https://prismic.io/docs/technologies/link-resolver-gatsby
 *
 * @param doc Prismic document to resolve to a URL within your app.
 *
 * @returns URL for the provided Prismic document.
 */
exports.linkResolver = (doc) => {
  switch (doc.type) {
    case 'page': {
      if (doc.uid === 'home') {
        return '/'
      } else {
        return `/${doc.uid}/`
      }
    }

    default:
      return '/'
  }
}
