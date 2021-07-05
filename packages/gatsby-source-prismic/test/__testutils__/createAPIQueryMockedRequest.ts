import * as msw from 'msw'
import * as prismic from '@prismicio/client'

import { createAuthorizationHeader } from './createAuthorizationHeader'

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
  queryResponse: prismic.Query,
  searchParams: APIQueryParams = {},
): msw.RestHandler =>
  msw.rest.get(
    resolveURL(pluginOptions.apiEndpoint, './documents/search'),
    (req, res, ctx) => {
      const resolvedSearchParams = {
        ref: 'master',
        pageSize: 100,
        ...searchParams,
      }

      const searchParamsMatch = Object.keys(resolvedSearchParams).every(
        (key) =>
          req.url.searchParams.get(key) ===
          resolvedSearchParams[key as keyof APIQueryParams]?.toString(),
      )

      if (
        (searchParamsMatch &&
          req.headers.get('Authorization') ===
            createAuthorizationHeader(
              searchParams.accessToken ?? pluginOptions.accessToken,
            )) ||
        !pluginOptions.accessToken
      ) {
        return res(ctx.json(queryResponse))
      } else {
        return res(
          ctx.status(403),
          ctx.json({
            error: '[MOCK ERROR]',
            oauth_initiate: 'oauth_initiate',
            oauth_token: 'oauth_token',
          }),
        )
      }
    },
  )
