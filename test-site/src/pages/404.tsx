import * as React from 'react'
import { withPrismicUnpublishedPreview } from 'gatsby-plugin-prismic-previews'

import { unpublishedRepositoryConfigs } from '../prismicUnpublishedPreviews'

const NotFoundPage = () => <>404 Not Found</>

export default withPrismicUnpublishedPreview(
  NotFoundPage,
  unpublishedRepositoryConfigs,
)
