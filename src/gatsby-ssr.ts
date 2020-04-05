import { GatsbySSR, RenderBodyArgs } from 'gatsby'
import React from 'react'

import { PluginOptions } from './types'

export const onRenderBody: GatsbySSR['onRenderBody'] = async (
  gatsbyContext: RenderBodyArgs,
  options: PluginOptions,
) => {
  const { setHeadComponents } = gatsbyContext

  if (!options.prismicToolbar) return

  const toolbarScript = React.createElement('script', {
    src: `//static.cdn.prismic.io/prismic.js?repo=${options.repositoryName}&new=true`,
    async: true,
    defer: true,
  })

  setHeadComponents([toolbarScript])
}
