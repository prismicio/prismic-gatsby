import * as gatsby from 'gatsby'
import * as gsp from 'gatsby-source-prismic'
import md5 from 'tiny-hashes/md5'

import {
  TYPE_PATHS_BASENAME_TEMPLATE,
  TYPE_PATHS_MISSING_BROWSER_MSG,
  REPORTER_TEMPLATE,
} from '../constants'

import { sprintf } from './sprintf'

export const fetchTypePathsStore = async (
  repositoryName: string,
): Promise<gsp.TypePathsStoreInstance> => {
  const basename = md5(sprintf(TYPE_PATHS_BASENAME_TEMPLATE, repositoryName))
  const url = gatsby.withAssetPrefix(`/static/${basename}.json`)

  const res = await fetch(url)

  if (res.ok) {
    const json = await res.json()

    return gsp.deserializeTypePathsStore(json)
  } else {
    throw new Error(
      sprintf(
        REPORTER_TEMPLATE,
        repositoryName,
        TYPE_PATHS_MISSING_BROWSER_MSG,
      ),
    )
  }
}
