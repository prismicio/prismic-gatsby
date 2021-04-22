import * as msw from 'msw'
import * as prismic from 'ts-prismic'

import { PluginOptions } from '../../src'

const DEFAULT_RESPONSE: prismic.Response.Repository = {
  types: { foo: 'Foo' },
  refs: [
    {
      id: 'master',
      ref: 'master',
      isMasterRef: true,
      label: 'master',
      scheduledAt: 'scheduledAt',
    },
    {
      id: 'release',
      ref: 'release',
      isMasterRef: false,
      label: 'release',
      scheduledAt: 'scheduledAt',
    },
  ],
  bookmarks: {},
  tags: [],
  licence: 'license',
  languages: [{ id: 'fr-fr', name: 'fr-fr' }],
  experiments: {},
  oauth_initiate: 'oauth_initiate',
  oauth_token: 'oauth_token',
  version: 'version',
}

export const createAPIRepositoryMockedRequest = (
  pluginOptions: PluginOptions,
  overrides?: Partial<prismic.Response.Repository>,
): msw.RestHandler =>
  msw.rest.get(pluginOptions.apiEndpoint, (req, res, ctx) => {
    if (
      req.url.searchParams.get('access_token') === pluginOptions.accessToken ||
      !pluginOptions.accessToken
    ) {
      return res(ctx.json({ ...DEFAULT_RESPONSE, ...overrides }))
    } else {
      return res(ctx.status(401))
    }
  })
