import * as msw from 'msw'
import * as prismicT from '@prismicio/types'
import * as prismicMock from '@prismicio/mock'

import { isValidAccessToken } from './isValidAccessToken'

import { PluginOptions } from '../../src'

export const createAPIRepositoryMockedRequest = (
  pluginOptions: PluginOptions,
  overrides?: Partial<prismicT.Repository>,
): msw.RestHandler =>
  msw.rest.get(pluginOptions.apiEndpoint, (req, res, ctx) => {
    if (isValidAccessToken(pluginOptions.accessToken, req)) {
      const repository = prismicMock.api.repository()

      return res(
        ctx.json({
          ...repository,
          ...overrides,
        }),
      )
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
  })
