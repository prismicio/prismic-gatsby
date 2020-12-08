import * as gatsby from 'gatsby'
import * as React from 'react'
import { UnknownRecord } from 'gatsby-prismic-core'

import { getComponentDisplayName } from './lib/getComponentDisplayName'

import { useMergePrismicPreviewData } from './useMergePrismicPreviewData'
import { usePrismicPreview, UsePrismicPreviewConfig } from './usePrismicPreview'

export interface WithPreviewProps {
  isPreview: boolean
  previewIsLoading: boolean
}

type WithPreviewConfig = {
  repositoryName: UsePrismicPreviewConfig['repositoryName']
}

export const withPreview = <TProps extends gatsby.PageProps<UnknownRecord>>(
  WrappedComponent: React.ComponentType<TProps>,
  config: WithPreviewConfig,
): React.ComponentType<TProps & WithPreviewProps> => {
  const WithPreview = (props: TProps): React.ReactElement => {
    const { isLoading } = usePrismicPreview({
      repositoryName: config.repositoryName,
    })

    const { data, isPreview } = useMergePrismicPreviewData(props.data)

    return (
      <WrappedComponent
        {...props}
        data={data}
        isPreview={isPreview}
        previewIsLoading={isLoading}
      />
    )
  }
  WithPreview.displayName = `withPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreview
}
