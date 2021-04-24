/**
 * This file contains configuration for `gatsby-plugin-prismic-previews` to
 * support preview sessions from Prismic.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/tree/alpha/packages/gatsby-plugin-prismic-previews
 */

import {
  componentResolverFromMap,
  UsePrismicPreviewBootstrapConfig,
  WithPrismicUnpublishedPreviewConfig,
} from 'gatsby-plugin-prismic-previews'

import { linkResolver } from './linkResolver'

import PageTemplate from './pages/{PrismicPage.url}'

/**
 * Prismic preview configuration for each repository in your app. This set of
 * configuration objects will be used with the `withPrismicPreview`,
 * `withPrismicPreviewResolver`, and `withPrismicUnpublishedPreview` higher
 * order components.
 *
 * If your app needs to support multiple Prismic repositories, add each of
 * their own configuration objects here as additional properties.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/tree/alpha/packages/gatsby-plugin-prismic-previews#content-pages-and-templates
 */
export const repositoryConfigs: UsePrismicPreviewBootstrapConfig = {
  [process.env.GATSBY_PRISMIC_REPOSITORY_NAME!]: { linkResolver },
}

/**
 * `gatsby-plugin-prismic-previews` configuration for unpublished previews.
 * This configuration object will be used with the `withPrismicUnpublishedPreview`
 * higher order component on your 404 Not Found page (`src/pages/404.tsx`).
 *
 * Update the `componentResolver` option anytime a new custom type is created
 * in your Prismic repository or a template is created within your project.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/blob/alpha/packages/gatsby-plugin-prismic-previews/docs/api-withPrismicUnpublishedPreview.md
 */
export const unpublishedPreviewConfig: WithPrismicUnpublishedPreviewConfig = {
  componentResolver: componentResolverFromMap({
    page: PageTemplate,
  }),
}
