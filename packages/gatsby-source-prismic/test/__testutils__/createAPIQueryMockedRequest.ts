import * as msw from 'msw'
import * as prismic from 'ts-prismic'
import { PluginOptions } from '../../src'

const resolveURL = (apiEndpoint: string, to: string): string => {
  const resolvedUrl = new URL(to, new URL(apiEndpoint + '/', 'resolve://'))

  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl

    return pathname + search + hash
  }

  return resolvedUrl.toString()
}

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

      const searchParamsMatch = Object.keys(resolvedSearchParams).every(
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
