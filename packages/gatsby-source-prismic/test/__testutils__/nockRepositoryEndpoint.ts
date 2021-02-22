import nock from 'nock'

import { PluginOptions } from '../../src'

import { getURLOrigin } from './getURLOrigin'

export const nockRepositoryEndpoint = (
  pluginOptions: PluginOptions,
  path = '/api/v2',
): nock.Scope =>
  nock(getURLOrigin(pluginOptions.apiEndpoint))
    .get(path)
    .query({ access_token: pluginOptions.accessToken })
    .reply(200, {
      types: { foo: 'Foo' },
      refs: [
        {
          id: 'master',
          ref: 'master',
          isMasterRef: true,
        },
        {
          id: 'release',
          ref: 'release',
          isMasterRef: false,
        },
      ],
    })
