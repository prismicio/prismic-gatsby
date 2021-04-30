/**
 * This file contains configuration for `gatsby-plugin-prismic-previews` to
 * support preview sessions from Prismic with unpublished documents.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/tree/alpha/packages/gatsby-plugin-prismic-previews
 */

import {
  componentResolverFromMap,
  PrismicUnpublishedRepositoryConfigs,
} from 'gatsby-plugin-prismic-previews'

import { linkResolver } from './linkResolver'

import KitchenSinkTemplate from './pages/{PrismicPrefixKitchenSink.uid}'

/**
 * Prismic preview configuration for each repository in your app. This set of
 * configuration objects will be used with the `withPrismicUnpublishedPreview`
 * higher order component.
 *
 * If your app needs to support multiple Prismic repositories, add each of
 * their own configuration objects here as additional elements.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/tree/alpha/packages/gatsby-plugin-prismic-previews#404-not-found-page
 */
export const unpublishedRepositoryConfigs: PrismicUnpublishedRepositoryConfigs = [
  {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    repositoryName: process.env.GATSBY_PRISMIC_REPOSITORY_NAME!,
    linkResolver,
    componentResolver: componentResolverFromMap({
      kitchen_sink: KitchenSinkTemplate,
    }),
  },
]
