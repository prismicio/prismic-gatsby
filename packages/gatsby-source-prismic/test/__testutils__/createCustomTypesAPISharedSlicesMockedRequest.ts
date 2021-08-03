import * as msw from 'msw'
import * as prismicT from '@prismicio/types'

import { resolveURL } from './resolveURL'

import { PluginOptions } from '../../src'

export const createCustomTypesAPISharedSlicesMockedRequest = (
  pluginOptions: Pick<
    PluginOptions,
    'repositoryName' | 'customTypesApiToken' | 'customTypesApiEndpoint'
  >,
  response: prismicT.SharedSliceModel[],
): msw.RestHandler =>
  msw.rest.get(
    resolveURL(
      pluginOptions.customTypesApiEndpoint ||
        'https://customtypes.prismic.io/customtypes',
      '/slices',
    ),
    (req, res, ctx) => {
      const repositoryHeader = req.headers.get('repository')
      const authorizationHeader = req.headers.get('Authorization')

      if (
        repositoryHeader === pluginOptions.repositoryName &&
        authorizationHeader === `Bearer ${pluginOptions.customTypesApiToken}`
      ) {
        return res(ctx.json(response))
      } else {
        return res(ctx.status(401))
      }
    },
  )
