import { omit } from 'lodash/fp'
import md5 from 'md5'

import { validatePluginOptions } from '../common/validatePluginOptions'
import { IS_BROWSER, GLOBAL_STORE_KEY } from '../common/constants'

export const onClientEntry = async (_, rawPluginOptions) => {
  if (!IS_BROWSER) return

  const searchParams = new URLSearchParams(window.location.search)
  const isPreviewSession =
    searchParams.has('token') && searchParams.has('documentId')

  if (isPreviewSession) {
    const pluginOptions = await validatePluginOptions(
      omit(['schemas', 'plugins'], rawPluginOptions),
      false,
    )
    const schemasDigest = md5(JSON.stringify(rawPluginOptions.schemas))

    window[GLOBAL_STORE_KEY] = {
      [rawPluginOptions.repositoryName]: {
        pluginOptions,
        schemasDigest,
      },
    }
  }
}
