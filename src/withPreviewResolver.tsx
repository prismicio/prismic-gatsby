import * as React from 'react'
import { navigate, PageProps } from 'gatsby'

import {
  usePrismicPreview,
  UsePrismicPreviewOptions,
} from './usePrismicPreview'
import { usePreviewStore, ActionType } from './usePreviewStore'
import { getComponentDisplayName } from './utils'

export interface WithPreviewResolverProps {
  isPreview: boolean | undefined
  isLoading: boolean
}

export const withPreviewResolver = <TProps extends PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  options: UsePrismicPreviewOptions,
): React.ComponentType<TProps> => {
  const WithPreviewResolver = (props: TProps) => {
    const [, dispatch] = usePreviewStore()

    const { isLoading, isPreview, previewData, path } = usePrismicPreview(
      options,
    )

    React.useEffect(() => {
      if (isPreview && previewData && path) {
        dispatch({
          type: ActionType.AddPage,
          payload: { path, data: previewData },
        })
        navigate(path)
      }
    }, [isPreview, previewData, path, dispatch])

    return (
      <WrappedComponent
        {...props}
        isPreview={isPreview}
        isLoading={isLoading}
      />
    )
  }
  WithPreviewResolver.displayName = `withPreviewResolver(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreviewResolver
}
