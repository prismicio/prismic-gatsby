import React from 'react'
import { GatsbySSR, RenderBodyArgs } from 'gatsby'

import { PluginOptions } from './types'

export const onRenderBody: NonNullable<GatsbySSR['onRenderBody']> = async (
  gatsbyContext: RenderBodyArgs,
  pluginOptions: PluginOptions,
) => {
  const { setPostBodyComponents } = gatsbyContext

  if (!pluginOptions.prismicToolbar) return

  let toolbarScriptUrl: string

  switch (pluginOptions.prismicToolbar) {
    // Use the latest script URL. Note the `new` URL parameter.
    case true: {
      toolbarScriptUrl = `//static.cdn.prismic.io/prismic.js?repo=${pluginOptions.repositoryName}&new=true`
      break
    }

    // Use the legacy script URL for older repositories. Note the lack of the
    // `new` URL parameter.
    case 'legacy': {
      toolbarScriptUrl = `//static.cdn.prismic.io/prismic.js?repo=${pluginOptions.repositoryName}`
      break
    }
  }

  const toolbarScript = React.createElement('script', {
    src: toolbarScriptUrl,
    defer: true,
  })

  setPostBodyComponents([toolbarScript])
}
