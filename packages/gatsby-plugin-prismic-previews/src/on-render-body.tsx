import * as React from 'react'
import * as gatsby from 'gatsby'

import { PluginOptions } from './types'

const getToolbarScriptURL = (
  repositoryName: string,
  type: PluginOptions['toolbar'],
): string => {
  switch (type) {
    case 'new': {
      return `//static.cdn.prismic.io/prismic.js?repo=${repositoryName}&new=true`
    }

    case 'legacy': {
      return `//static.cdn.prismic.io/prismic.js?repo=${repositoryName}`
    }
  }
}

export const onRenderBody: NonNullable<
  gatsby.GatsbySSR['onRenderBody']
> = async (
  gatsbyContext: gatsby.RenderBodyArgs,
  pluginOptions: PluginOptions,
) => {
  gatsbyContext.setPostBodyComponents([
    <script
      src={getToolbarScriptURL(
        pluginOptions.repositoryName,
        pluginOptions.toolbar,
      )}
      defer={true}
      key={`prismic-toolbar-${pluginOptions.repositoryName}`}
    />,
  ])
}
