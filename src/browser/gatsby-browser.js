import md5 from 'md5'
import queryString from 'query-string'

import { IS_BROWSER, GLOBAL_STORE_KEY } from '../common/constants'
import { validatePluginOptions } from '../common/validatePluginOptions'
import { omit } from '../common/utils'

export const onClientEntry = async (_, rawPluginOptions) => {
  if (!IS_BROWSER) return

  const searchParams = queryString.parse(window.location.search)
  const isPreviewSession = searchParams.token && searchParams.documentId

  if (isPreviewSession) {
    const pluginOptions = validatePluginOptions(
      omit(['schemas', 'plugins'])(rawPluginOptions),
      { schemas: false, schemasDigest: false },
    )
    const schemasDigest = md5(JSON.stringify(rawPluginOptions.schemas))

    window[GLOBAL_STORE_KEY] = window[GLOBAL_STORE_KEY] || {}

    Object.assign(window[GLOBAL_STORE_KEY], {
      [rawPluginOptions.repositoryName]: {
        pluginOptions,
        schemasDigest,
      },
    })
  }
}
