import * as React from 'react'
import * as gatsby from 'gatsby'

import { PluginOptions } from './types'

/**
 * Returns the URL for the Prismic Toolbar script.
 *
 * @param repositoryName Name of the repository.
 * @param type Type of the toolbar to use.
 *
 * @returns URL for the Prismic Toolbar script.
 */
const getToolbarScriptURL = (
  repositoryName: string,
  type: PluginOptions['toolbar'],
): URL => {
  switch (type) {
    case 'new': {
      return new URL(`https://static.cdn.prismic.io/prismic.js?repo=${repositoryName}&new=true`)
    }

    case 'legacy': {
      return new URL(`https://static.cdn.prismic.io/prismic.js?repo=${repositoryName}`)
    }
  }
}

/**
 * Called after every page Gatsby server renders while building HTML so it can
 * set head and body components to be rendered in the app's `html.js`.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr#onRenderBody
 */
// TODO: Explore what happens when multiple instances of the plugin are
// configured. Will multiple toolbars cause conflicts?
export const onRenderBody: NonNullable<gatsby.GatsbySSR['onRenderBody']> =
  async (
    gatsbyContext: gatsby.RenderBodyArgs,
    pluginOptions: PluginOptions,
  ) => {
    const toolbarScriptUrl = getToolbarScriptURL(
      pluginOptions.repositoryName,
      pluginOptions.toolbar,
    )

    gatsbyContext.setHeadComponents([
      <link
        rel="preconnect"
        key="preconnect-prismic-toolbar"
        href={toolbarScriptUrl.origin}
      />,
      <link
        rel="dns-prefetch"
        key="dns-prefetch-prismic-toolbar"
        href={toolbarScriptUrl.origin}
      />,
    ])

    gatsbyContext.setPostBodyComponents([
      <script
        src={toolbarScriptUrl.href}
        defer={true}
        key={`gatsby-plugin-prismic-previews-toolbar-${pluginOptions.repositoryName}`}
      />,
    ])
  }
