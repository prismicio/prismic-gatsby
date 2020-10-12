import * as gatsby from 'gatsby'
import * as React from 'react'
import {
  ANONYMOUS_REPORTER_TEMPLATE,
  sprintf,
  UnknownRecord,
} from 'gatsby-prismic-core'

import { getComponentDisplayName } from './lib/getComponentDisplayName'

import { usePrismicUnpublishedPreviewData } from './usePrismicUnpublishedPreviewData'

export interface WithUnpublishedPreviewProps {
  isPreview: boolean
}

type WithUnpublishedPreviewConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateMap: Record<string, React.ComponentType<any>>
}

export const withUnpublishedPreview = <
  TProps extends gatsby.PageProps<UnknownRecord>
>(
  WrappedComponent: React.ComponentType<TProps>,
  config: WithUnpublishedPreviewConfig,
): React.ComponentType<TProps> => {
  const WithPreview = (props: TProps): React.ReactElement => {
    const preview = usePrismicUnpublishedPreviewData(props.data, {
      pagePath: props.path,
    })

    if (preview.isPreview) {
      const TemplateComp = config.templateMap[preview.type]
      if (TemplateComp)
        return (
          <TemplateComp
            {...props}
            data={preview.data}
            isPreview={preview.isPreview}
          />
        )
      else
        console.warn(
          sprintf(
            ANONYMOUS_REPORTER_TEMPLATE,
            `An unpublished preview was detected, but a template component could not be found for a custom type of "${preview.type}". Check that the templateMap option in withUnpublishedPreview includes a component for "${preview.type}". withUnpublishedPreview will yield to the wrapped component.`,
          ),
        )
    }

    return <WrappedComponent {...props} isPreview={false} />
  }
  WithPreview.displayName = `withUnpublishedPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithPreview
}
