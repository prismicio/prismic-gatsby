import * as msw from 'msw'
import * as mswNode from 'msw/node'

import { PluginOptions } from '../../src'
import { resolveAPIURL } from './resolveURL'

export const setupRepositoryEndpointMock = (
  server: mswNode.SetupServerApi,
  pluginOptions: PluginOptions,
  path = '/api/v2',
): void =>
  server.use(
    msw.rest.get(
      resolveAPIURL(pluginOptions.apiEndpoint, path),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') === pluginOptions.accessToken
          ? res(
              ctx.json({
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
              }),
            )
          : res(ctx.status(401)),
    ),
  )
