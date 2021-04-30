import test from 'ava'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import md5 from 'tiny-hashes/md5'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewRef } from './__testutils__/createPreviewRef'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { createTypePathsMockedRequest } from './__testutils__/createTypePathsMockedRequest'
import { polyfillKy } from './__testutils__/polyfillKy'
import { resolveURL } from './__testutils__/resolveURL'

import {
  PrismicAPIDocumentNodeInput,
  PrismicPreviewProvider,
  usePrismicPreviewBootstrap,
  usePrismicPreviewContext,
  PluginOptions,
  PrismicRepositoryConfigs,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

const createRepositoryConfigs = (
  pluginOptions: PluginOptions,
): PrismicRepositoryConfigs => [
  {
    repositoryName: pluginOptions.repositoryName,
    linkResolver: (doc): string => `/${doc.uid}`,
  },
]

const nodeHelpers = createNodeHelpers({
  typePrefix: 'Prismic prefix',
  fieldPrefix: 'Prismic',
  createNodeId: (id) => md5(id),
  createContentDigest: (input) => md5(JSON.stringify(input)),
})

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()
  browserEnv(['window', 'document'])
  server.listen({ onUnhandledRequest: 'error' })
  globalThis.__PATH_PREFIX__ = 'https://example.com'
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

test.serial('initial state', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(() => usePrismicPreviewBootstrap(config), {
    wrapper: PrismicPreviewProvider,
  })
  const state = result.current[0]

  t.true(state.state === 'INIT')
  t.true(state.error === undefined)
})

test.serial('fails if not a preview session - cookie is not set', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewBootstrap(config),
    { wrapper: PrismicPreviewProvider },
  )

  act(() => {
    const [, bootstrapPreview] = result.current
    bootstrapPreview()
  })

  await waitForNextUpdate()

  const state = result.current[0]

  t.true(state.state === 'FAILED')
  t.true(
    state.error?.message && /not a preview session/i.test(state.error.message),
  )
})

test.serial(
  'fetches all repository documents and bootstraps context',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    const config = createRepositoryConfigs(pluginOptions)
    const queryResponsePage1 = createPrismicAPIQueryResponse(undefined, {
      page: 1,
      total_pages: 2,
    })
    const queryResponsePage2 = createPrismicAPIQueryResponse(undefined, {
      page: 2,
      total_pages: 2,
    })

    const ref = createPreviewRef(pluginOptions.repositoryName)
    cookie.set(prismic.cookie.preview, ref)

    const queryResponsePage1Nodes = queryResponsePage1.results.map((doc) => {
      const node = nodeHelpers.createNodeFactory(doc.type)(
        doc,
      ) as PrismicAPIDocumentNodeInput

      return {
        ...node,
        url: config[0].linkResolver(doc),
      }
    })

    const queryResponsePage2Nodes = queryResponsePage2.results.map((doc) => {
      const node = nodeHelpers.createNodeFactory(doc.type)(
        doc,
      ) as PrismicAPIDocumentNodeInput

      return {
        ...node,
        url: config[0].linkResolver(doc),
      }
    })

    // We're testing pagination functionality here. We need to make sure the hook
    // will fetch all documents in a repository, not just the first page of
    // results.

    server.use(
      msw.rest.get(
        resolveURL(pluginOptions.apiEndpoint, './documents/search'),
        (req, res, ctx) => {
          if (
            req.url.searchParams.get('access_token') ===
              pluginOptions.accessToken &&
            req.url.searchParams.get('ref') === ref &&
            req.url.searchParams.get('lang') === pluginOptions.lang &&
            req.url.searchParams.get('graphQuery') ===
              pluginOptions.graphQuery &&
            req.url.searchParams.get('pageSize') === '100'
          ) {
            switch (req.url.searchParams.get('page')) {
              case '1':
                return res(ctx.json(queryResponsePage1))
              case '2':
                return res(ctx.json(queryResponsePage2))
              default:
                return res(ctx.status(401))
            }
          } else {
            return res(ctx.status(401))
          }
        },
      ),
    )

    server.use(
      createTypePathsMockedRequest('fa7e36097b060b84eb14d0df1009fa58.json', {
        type: gatsbyPrismic.PrismicSpecialType.Document,
        'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      }),
    )

    // @ts-expect-error - Partial gatsbyContext provided
    await onClientEntry(gatsbyContext, pluginOptions)
    const { result, waitForValueToChange } = renderHook(
      () => {
        const context = usePrismicPreviewContext()
        const bootstrap = usePrismicPreviewBootstrap(config)

        return { bootstrap, context }
      },
      { wrapper: PrismicPreviewProvider },
    )

    t.true(result.current.bootstrap[0].state === 'INIT')

    act(() => {
      const [, bootstrapPreview] = result.current.bootstrap
      bootstrapPreview()
    })

    await waitForValueToChange(() => result.current.bootstrap[0].state)
    t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPING')

    await waitForValueToChange(() => result.current.bootstrap[0].state)
    t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPED')
    t.true(result.current.bootstrap[0].error === undefined)
    t.true(result.current.context[0].isBootstrapped)
    t.deepEqual(result.current.context[0].nodes, {
      [queryResponsePage1Nodes[0].prismicId]: queryResponsePage1Nodes[0],
      [queryResponsePage1Nodes[1].prismicId]: queryResponsePage1Nodes[1],
      [queryResponsePage2Nodes[0].prismicId]: queryResponsePage2Nodes[0],
      [queryResponsePage2Nodes[1].prismicId]: queryResponsePage2Nodes[1],
    })
  },
)

test.serial('fails if already bootstrapped', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)
  const queryResponsePage1 = createPrismicAPIQueryResponse(undefined, {
    page: 1,
    total_pages: 2,
  })
  const queryResponsePage2 = createPrismicAPIQueryResponse(undefined, {
    page: 2,
    total_pages: 2,
  })

  const ref = createPreviewRef(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, ref)

  // We're testing pagination functionality here. We need to make sure the hook
  // will fetch all documents in a repository, not just the first page of
  // results.

  server.use(
    msw.rest.get(
      resolveURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) => {
        if (
          req.url.searchParams.get('access_token') ===
            pluginOptions.accessToken &&
          req.url.searchParams.get('ref') === ref &&
          req.url.searchParams.get('lang') === pluginOptions.lang &&
          req.url.searchParams.get('graphQuery') === pluginOptions.graphQuery &&
          req.url.searchParams.get('pageSize') === '100'
        ) {
          switch (req.url.searchParams.get('page')) {
            case '1':
              return res(ctx.json(queryResponsePage1))
            case '2':
              return res(ctx.json(queryResponsePage2))
            default:
              return res(ctx.status(401))
          }
        } else {
          return res(ctx.status(401))
        }
      },
    ),
  )

  server.use(
    createTypePathsMockedRequest('dc161c24076d1389d05e2e60aafa3a3f.json', {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
    }),
  )

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForValueToChange } = renderHook(
    () => usePrismicPreviewBootstrap(config),
    { wrapper: PrismicPreviewProvider },
  )

  t.true(result.current[0].state === 'INIT')

  // Bootstrap the first time.
  act(() => {
    const [, bootstrapPreview] = result.current
    bootstrapPreview()
  })

  await waitForValueToChange(() => result.current[0].state)
  t.true(result.current[0].state === 'BOOTSTRAPPING')

  await waitForValueToChange(() => result.current[0].state)
  t.true(result.current[0].state === 'BOOTSTRAPPED')
  t.true(result.current[0].error === undefined)

  // Bootstrap the second time.
  act(() => {
    result.current[1]()
  })

  await waitForValueToChange(() => result.current[0].state)
  t.true(result.current[0].state === 'FAILED')
  t.true(
    result.current[0].error?.message &&
      /already been bootstrapped/i.test(result.current[0].error.message),
  )
})
