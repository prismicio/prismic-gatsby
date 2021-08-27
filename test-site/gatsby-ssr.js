import * as React from 'react'
import { PrismicPreviewProvider } from 'gatsby-plugin-prismic-previews'

export const wrapRootElement = ({ element }) => (
  <PrismicPreviewProvider>{element}</PrismicPreviewProvider>
)
