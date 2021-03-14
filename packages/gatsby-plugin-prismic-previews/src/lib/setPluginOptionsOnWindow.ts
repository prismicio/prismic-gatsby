import * as IO from 'fp-ts/IO'

import { WINDOW_PLUGIN_OPTIONS_KEY } from '../constants'
import { PluginOptions } from '../types'

declare global {
  interface Window {
    [WINDOW_PLUGIN_OPTIONS_KEY]: Record<string, PluginOptions>
  }
}

export const setPluginOptionsOnWindow = (
  pluginOptions: PluginOptions,
): IO.IO<void> => () => {
  window[WINDOW_PLUGIN_OPTIONS_KEY] = {
    ...window[WINDOW_PLUGIN_OPTIONS_KEY],
    [pluginOptions.repositoryName]: pluginOptions,
  }
}
