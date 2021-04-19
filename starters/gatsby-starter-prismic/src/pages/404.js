import * as React from 'react'
import {
  withPrismicUnpublishedPreview,
  componentResolverFromMap,
} from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

import PageTemplate from './{PrismicPage.url}'

import { Layout } from '../components/Layout'
import { SEO } from '../components/SEO'

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>404: Not Found</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export default withPrismicUnpublishedPreview(
  NotFoundPage,
  {
    [process.env.GATSBY_PRISMIC_REPOSITORY_NAME]: { linkResolver },
  },
  {
    componentResolver: componentResolverFromMap({
      page: PageTemplate,
    }),
  },
)
