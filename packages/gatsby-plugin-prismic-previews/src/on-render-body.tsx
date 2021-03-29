import * as React from 'react'
import * as gatsby from 'gatsby'

import { PluginOptions } from './types'

const getToolbarScriptURL = (
  repositoryName: string,
  type: PluginOptions['toolbar'],
): string => {
  switch (type) {
    case 'new': {
      return `https://static.cdn.prismic.io/prismic.js?repo=${repositoryName}&new=true`
    }

    case 'legacy': {
      return `https://static.cdn.prismic.io/prismic.js?repo=${repositoryName}`
    }
  }
}

// TODO: Explore what happens when multiple instances of the plugin are
// configured. Will multiple toolbars cause conflicts (probably yes).
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
      key={`gatsby-plugin-prismic-previews-toolbar-${pluginOptions.repositoryName}`}
    />,
  ])
}
