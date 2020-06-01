import * as React from 'react'
import { PageProps, Node } from 'gatsby'

import { mergePrismicPreviewData } from './mergePrismicPreviewData'
import { usePreviewStore } from './usePreviewStore'
import { getComponentDisplayName } from './utils'

export const withPreview = <TProps extends PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps> => {
  const WithPreview = (props: TProps) => {
    const [state] = usePreviewStore()

    const path = props.location.pathname
    const staticData = props.data
    const previewData = state.pages[path]

    const data = React.useMemo(
      () =>
        state.enabled
          ? mergePrismicPreviewData({
              staticData,
              previewData: previewData as { [key: string]: Node },
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
