/**
 * This file is used as the Prismic preview resolver page. The preview resolver
 * page routes editors from the Prismic writing room to a previewed document
 * within your app. For example, if an editor clicks the preview button for a
 * blog post in the writing room, they will land on the preview resolver page
 * within your app, which then redirects them to the blog post with previewed
 * content.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/blob/alpha/packages/gatsby-plugin-prismic-previews/docs/api-withPrismicPreviewResolver.md
 */

import * as React from 'react'
import { navigate, PageProps } from 'gatsby'
import {
  withPrismicPreviewResolver,
  WithPrismicPreviewResolverProps,
} from 'gatsby-plugin-prismic-previews'
import { repositoryConfigs } from '../prismicPreviews'

type PreviewPageProps = PageProps & WithPrismicPreviewResolverProps

const PreviewPage = ({ isPrismicPreview }: PreviewPageProps) => {
  React.useEffect(() => {
    // If a visitor lands on this page and they did not come from the Prismic
    // writing room, redirect to the homepage.
    if (isPrismicPreview === false) {
      navigate('/')
    }
  }, [isPrismicPreview])

  return null
}

/**
 * `withPrismicPreviewResolver` will automatically redirect editors coming from
 * the Prismic writing room to the document they are previewing.
 *
 * @see https://github.com/angeloashmore/gatsby-source-prismic/blob/alpha/packages/gatsby-plugin-prismic-previews/docs/api-withPrismicPreviewResolver.md
 */
export default withPrismicPreviewResolver(PreviewPage, repositoryConfigs)
