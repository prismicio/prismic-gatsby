import * as msw from 'msw'

import { TypePathsStore } from '../../src'

import { resolveURL } from './resolveURL'

export const createTypePathsMockedRequest = (
  filename: string,
  typePaths: TypePathsStore,
): msw.RestHandler =>
  msw.rest.get(
    resolveURL(globalThis.__PATH_PREFIX__, `/static/${filename}`),
    (_req, res, ctx) => res(ctx.json(typePaths)),
  )
