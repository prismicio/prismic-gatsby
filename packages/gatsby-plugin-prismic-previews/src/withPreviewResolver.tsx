import * as React from 'react'
import * as gatsby from 'gatsby'

import { getComponentDisplayName } from './lib/getComponentDisplayName'

import {
  usePrismicPreviewResolver,
  UsePrismicPreviewResolverConfig,
} from './usePrismicPreviewResolver'

export interface WithPreviewResolverProps {
  isPreview?: boolean
  isLoading: boolean
  previewPath?: string
}

type WithPreviewResolverConfig = UsePrismicPreviewResolverConfig

export const withPreviewResolver = <TProps extends gatsby.PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  config: WithPreviewResolverConfig,
): React.ComponentType<TProps> => {
  const WithPreviewResolver = (props: TProps): React.ReactElement => {
    const { isLoading, isPreview, path } = usePrismicPreviewResolver(config)

    return (
      <WrappedComponent
        {...props}
        isPreview={isPreview}
        isLoading={isLoading}
        previewPath={path}
      />
    )
  }
  WithPreviewResolver.displayName = `withPreviewResolver(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreviewResolver
}
