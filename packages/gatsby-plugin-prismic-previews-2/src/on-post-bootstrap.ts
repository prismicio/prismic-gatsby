import * as gatsby from 'gatsby'
import * as path from 'path'
import { promises as fs } from 'fs'
import md5 from 'tiny-hashes/md5'
import { TYPE_PATHS_CACHE_KEY_TEMPLATE } from 'gatsby-source-prismic'

import {
  REPORTER_TEMPLATE,
  TYPE_PATHS_BASENAME_TEMPLATE,
  TYPE_PATHS_MISSING_NODE_MSG,
  WROTE_TYPE_PATHS_TO_FS_MSG,
} from './constants'
import { PluginOptions } from './types'
import { sprintf } from './lib/sprintf'

export const onPostBootstrap: NonNullable<
  gatsby.GatsbyNode['onPostBootstrap']
> = async (gatsbyContext, pluginOptions: PluginOptions) => {
  const { cache, reporter } = gatsbyContext

  const cacheKey = sprintf(
    TYPE_PATHS_CACHE_KEY_TEMPLATE,
    pluginOptions.repositoryName,
  )
  const serialiedTypePathsStore = await cache.get(cacheKey)

  if (serialiedTypePathsStore) {
    const basename = md5(
      sprintf(TYPE_PATHS_BASENAME_TEMPLATE, pluginOptions.repositoryName),
    )
    const filename = `${basename}.json`
    const publicPath = path.resolve(process.cwd(), 'public', 'static', filename)

    await fs.writeFile(publicPath, serialiedTypePathsStore)

    reporter.verbose(
      sprintf(
        REPORTER_TEMPLATE,
        pluginOptions.repositoryName,
        sprintf(WROTE_TYPE_PATHS_TO_FS_MSG, publicPath),
      ),
    )
  } else {
    reporter.panic(
      sprintf(
        REPORTER_TEMPLATE,
        pluginOptions.repositoryName,
        TYPE_PATHS_MISSING_NODE_MSG,
      ),
    )
  }
}
