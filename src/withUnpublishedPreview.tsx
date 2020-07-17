import * as React from 'react'
import { PageProps } from 'gatsby'

import { usePreviewStore } from './usePreviewStore'
import { withPreview } from './withPreview'
import { msg, getComponentDisplayName } from './utils'

type WithUnpublishedPreviewArgs = {
  templateMap: Record<string, React.ComponentType<any>>
}

export const withUnpublishedPreview = <TProps extends PageProps>(
  WrappedComponent: React.ComponentType<TProps>,
  options: WithUnpublishedPreviewArgs,
): React.ComponentType<TProps> => {
  const WithUnpublishedPreview = (props: TProps) => {
    const [state] = usePreviewStore()
    const path = props.location.pathname
    const isPreview = state.pages.hasOwnProperty(path)

    if (isPreview) {
      const previewData = state.pages[path]
      const key = Object.keys(previewData)[0]
      const type = previewData[key].type as string
      const TemplateComp = options.templateMap[type]

      if (TemplateComp) return <TemplateComp {...props} />
      else
        console.warn(
          msg(
            `An unpublished preview was detected, but a template component could not be found for a custom type of "${type}". Check that the templateMap option in withUnpublishedPreview includes a component for "${type}". withUnpublishedPreview will yield to the wrapped component to render.`,
          ),
        )
    }

    return <WrappedComponent {...props} />
  }
  WithUnpublishedPreview.displayName = `withUnpublishedPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return withPreview(WithUnpublishedPreview, {
    // In an unpublished preview, we have to assume the component accepts the
    // preview data as a root-level field.
    mergeStrategy: 'rootReplaceOrInsert',
  })
}
