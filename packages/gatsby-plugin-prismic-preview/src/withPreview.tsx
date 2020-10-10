import * as gatsby from 'gatsby'
import * as React from 'react'

import { UnknownRecord } from 'shared/types'

import { getComponentDisplayName } from './lib/getComponentDisplayName'

import { useMergePrismicPreviewData } from './useMergePrismicPreviewData'

export interface WithPreviewProps {
  isPreview: boolean
}

export const withPreview = <TProps extends gatsby.PageProps<UnknownRecord>>(
  WrappedComponent: React.ComponentType<TProps>,
): React.ComponentType<TProps & WithPreviewProps> => {
  const WithPreview = (props: TProps): React.ReactElement => {
    const { data, isPreview } = useMergePrismicPreviewData(props.data)

    return <WrappedComponent {...props} data={data} isPreview={isPreview} />
  }
  WithPreview.displayName = `withPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreview
}
