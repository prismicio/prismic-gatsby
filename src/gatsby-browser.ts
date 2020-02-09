import md5 from 'md5'
import omit from 'lodash.omit'

import { isBrowser } from './utils'
import { BROWSER_STORE_KEY } from './constants'

import { GatsbyBrowser } from 'gatsby'
import { BrowserPluginOptions } from './types'

declare global {
  interface Window {
    [BROWSER_STORE_KEY]: BrowserPluginOptionsStore
  }
}

interface BrowserPluginOptionsStore {
  [key: string]: {
    pluginOptions: BrowserPluginOptions
    schemasDigest: string
  }
}

export const onClientEntry: GatsbyBrowser['onClientEntry'] = (
  _gatsbyContext,
  pluginOptions: BrowserPluginOptions,
) => {
  if (!isBrowser) return

  const params = new URLSearchParams(window.location.search)
  const isPreviewSession = params.has('token') && params.has('documentId')

  if (!isPreviewSession) return

  let store = window[BROWSER_STORE_KEY]
  store = store || {}

  Object.assign(store, {
    [pluginOptions.repositoryName]: {
      pluginOptions: omit(pluginOptions, ['schemas', 'plugins']),
      schemasDigest: md5(JSON.stringify(pluginOptions.schemas)),
    },
  })
}
