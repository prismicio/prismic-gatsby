import * as React from 'react'
import { navigate } from 'gatsby'
import { withPrismicPreviewResolver } from 'gatsby-plugin-prismic-previews'

import { linkResolver } from '../linkResolver'

const PreviewPage = ({ isPrismicPreview }) => {
  React.useEffect(() => {
    // If a visitor lands on this page and they did not come from the Prismic
    // writing room, redirect to the homepage.
    if (isPrismicPreview === false) {
      navigate('/')
    }
  }, [isPrismicPreview])

  return null
}

export default withPrismicPreviewResolver(PreviewPage, {
  [process.env.GATSBY_PRISMIC_REPOSITORY_NAME]: { linkResolver },
})
