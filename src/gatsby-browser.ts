import md5 from 'md5'
import omit from 'lodash.omit'

import { BROWSER_STORE_KEY } from './constants'

import { GatsbyBrowser } from 'gatsby'
import { BrowserPluginOptions } from './types'

declare global {
  interface Window {
    [BROWSER_STORE_KEY]: BrowserPluginOptionsStore
    // Used for the legacy Prismic Toolbar script.
    prismic?: {
      endpoint?: string
    }
  }
}

export interface BrowserPluginOptionsStore {
  [key: string]: {
    pluginOptions: BrowserPluginOptions
    schemasDigest: string
  }
}

export const onClientEntry: GatsbyBrowser['onClientEntry'] = (
  _gatsbyContext,
  pluginOptions: BrowserPluginOptions,
) => {
  if (pluginOptions.prismicToolbar === 'legacy')
    // The legacy Prismic Toolbar script requires setting the endpoint globally
    // to window.
    window.prismic = {
      endpoint: `https://${pluginOptions.repositoryName}.cdn.prismic.io/api/v2`,
    }

  window[BROWSER_STORE_KEY] = Object.assign({}, window[BROWSER_STORE_KEY], {
    [pluginOptions.repositoryName]: {
      pluginOptions: omit(pluginOptions, ['schemas', 'plugins']),
      schemasDigest: md5(JSON.stringify(pluginOptions.schemas)),
    },
  })
}
