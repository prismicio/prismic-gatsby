import * as React from 'react'
import { PrismicPreviewProvider } from 'gatsby-plugin-prismic-previews'

import 'gatsby-plugin-prismic-previews/dist/index.css'

export const wrapRootElement = ({ element }) => (
  <PrismicPreviewProvider>{element}</PrismicPreviewProvider>
)
