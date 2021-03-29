import * as React from 'react'
import { graphql } from 'gatsby'
import { withPrismicPreview } from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

import { Layout } from '../components/Layout'
import { SEO } from '../components/SEO'

const PageTemplate = ({ data }) => (
  <Layout>
    <SEO title={data.prismicPage.data.title?.text} />
    <h1>{data.prismicPage.data.title?.text}</h1>
    {data.prismicPage.data.content?.text && (
      <div
        dangerouslySetInnerHTML={{
          __html: data.prismicPage.data.content?.html,
        }}
      />
    )}
  </Layout>
)

export default withPrismicPreview(PageTemplate, {
  [process.env.GATSBY_PRISMIC_REPOSITORY_NAME]: { linkResolver },
})

export const query = graphql`
  query PageTemplate($id: String!) {
    prismicPage(id: { eq: $id }) {
      _previewable
      data {
        title {
          text
        }
        content {
          text
          html
        }
      }
    }
  }
`
