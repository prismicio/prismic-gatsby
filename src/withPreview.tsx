import * as React from 'react'
import { PageProps } from 'gatsby'

import {
  mergePrismicPreviewData,
  MergePrismicPreviewDataArgs,
} from './mergePrismicPreviewData'
import { usePreviewStore } from './usePreviewStore'
import { getComponentDisplayName } from './utils'
import { NodeTree } from './types'

type WithPreviewArgs = {
  mergeStrategy?: MergePrismicPreviewDataArgs['strategy']
}

export const withPreview = <TProps extends PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  options?: WithPreviewArgs,
): React.ComponentType<TProps> => {
  const WithPreview = (props: TProps) => {
    const [state] = usePreviewStore()

    const path = props.location.pathname
    const staticData = props.data as NodeTree
    const previewData = state.pages[path]

    const data = React.useMemo(
      () =>
        state.enabled
          ? mergePrismicPreviewData({
              staticData,
              previewData,
              strategy: options?.mergeStrategy,
            })
          : staticData,
      [state.enabled, staticData, previewData],
    )

    return <WrappedComponent {...props} data={data} />
  }
  WithPreview.displayName = `withPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreview
}
