/**
 * This file is used as the 404 page in your app. If users go to a URL that does
 * not exist within your app, they will be shown this page.
 *
 * This page is also used to support Prismic preview session when viewing
 * documents that have not been published.
 *
 * @see https://www.gatsbyjs.com/docs/how-to/adding-common-features/add-404-page/
 * @see https://github.com/angeloashmore/gatsby-source-prismic/blob/alpha/packages/gatsby-plugin-prismic-previews/docs/api-withPrismicUnpublishedPreview.md
 */

import * as React from 'react'
import { withPrismicUnpublishedPreview } from 'gatsby-plugin-prismic-previews'

import { unpublishedRepositoryConfigs } from '../prismicUnpublishedPreviews'

import { Layout } from '../components/Layout'
import { SEO } from '../components/SEO'

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>404: Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

/**
 * When a Prismic preview session is active and an editor lands on the 404 page,
 * it means the app does not contain a page for the previewed document's URL
 * determined using your app's Link Resolver.
 *
 * `withPrismicUnpublishedPreview` will detect when a preview session is active
 * and try to display the previewed document using the configuration provided.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/blob/alpha/packages/gatsby-plugin-prismic-previews/docs/api-withPrismicUnpublishedPreview.md
 */
export default withPrismicUnpublishedPreview(
  NotFoundPage,
  unpublishedRepositoryConfigs,
)
