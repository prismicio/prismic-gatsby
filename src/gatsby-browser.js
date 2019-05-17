import * as R from 'ramda'
import md5 from 'md5'

import { validatePluginOptions } from './validatePluginOptions'

const isBrowser = typeof window !== 'undefined'

export const onClientEntry = async (_, rawPluginOptions) => {
  if (!isBrowser) return

  const searchParams = new URLSearchParams(window.location.search)
  const isPreviewSession =
    searchParams.has('token') && searchParams.has('documentId')

  if (isPreviewSession) {
    const pluginOptions = await validatePluginOptions(
      R.omit(['schemas', 'plugins'], rawPluginOptions),
      false,
    )
    const schemasDigest = md5(JSON.stringify(rawPluginOptions.schemas))

    window.___PRISMIC___ = {
      ...window.___PRISMIC___,
      pluginOptions,
      schemasDigest,
    }
  }
}
