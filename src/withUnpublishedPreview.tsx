import * as React from 'react'
import { PageProps } from 'gatsby'

import { usePreviewStore } from './usePreviewStore'
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
    const isPreview = state.pages.hasOwnProperty(props.location.pathname)

    if (isPreview) {
      const key = Object.keys(props.data)[0]
      const TemplateComp =
        options.templateMap[
          (props.data as Record<string, { type?: string }>)[key]
            .type as keyof typeof options.templateMap
        ]

      console.warn(
        msg(
          `An unpublished preview was detected, but a template component could not be found for a custom type of "${key}". Check that the templateMap option in withUnpublishedPreview includes a component for "${key}". withUnpublishedPreview will yield to the wrapped component to render.`,
        ),
      )

      if (TemplateComp) return <TemplateComp {...props} />
    }

    return <WrappedComponent {...props} />
  }
  WithUnpublishedPreview.displayName = `withUnpublishedPreview(${getComponentDisplayName(
    WrappedComponent,
  )})`

  return WithUnpublishedPreview
}
