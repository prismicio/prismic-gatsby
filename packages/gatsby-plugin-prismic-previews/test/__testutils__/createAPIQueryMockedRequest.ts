import * as msw from 'msw'
import * as prismic from 'ts-prismic'

import { PluginOptions } from '../../src'

import { resolveURL } from './resolveURL'

interface APIQueryParams extends prismic.QueryParams {
  accessToken?: string
  ref?: string
  q?: string
}

export const createAPIQueryMockedRequest = (
  pluginOptions: PluginOptions,
  queryResponse: prismic.Response.Query,
  searchParams: APIQueryParams = {},
): msw.RestHandler =>
  msw.rest.get(
    resolveURL(pluginOptions.apiEndpoint, './documents/search'),
    (req, res, ctx) => {
      const resolvedSearchParams = {
        ref: 'master',
        lang: pluginOptions.lang,
        page: 1,
        pageSize: 100,
        ...searchParams,
        access_token: searchParams.accessToken ?? pluginOptions.accessToken,
      }

      const searchParamsMatch = Object.keys(resolvedSearchParams)
        .filter(
          (key) => resolvedSearchParams[key as keyof APIQueryParams] != null,
        )
        .every(
          (key) =>
            req.url.searchParams.get(key) ===
            resolvedSearchParams[key as keyof APIQueryParams]?.toString(),
        )

      if (searchParamsMatch) {
        return res(ctx.json(queryResponse))
      } else {
        return res(ctx.status(401))
      }
    },
  )
