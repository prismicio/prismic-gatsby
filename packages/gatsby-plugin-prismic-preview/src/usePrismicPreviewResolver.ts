import * as React from 'react'
import * as gatsby from 'gatsby'

import { usePrismicPreview, UsePrismicPreviewConfig } from './usePrismicPreview'

export type UsePrismicPreviewResolverConfig = UsePrismicPreviewConfig

export const usePrismicPreviewResolver = (
  config: UsePrismicPreviewResolverConfig,
): ReturnType<typeof usePrismicPreview> => {
  const preview = usePrismicPreview(config)

  React.useEffect(() => {
    if (preview.isPreview && preview.path && preview.node)
      gatsby.navigate(preview.path)
  }, [preview.path, preview.node, preview.isPreview])

  return preview
}
