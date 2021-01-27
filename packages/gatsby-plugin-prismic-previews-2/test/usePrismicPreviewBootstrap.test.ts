import { renderHook, act } from '@testing-library/react-hooks'
import { createNodeHelpers } from 'gatsby-node-helpers'
import * as cookie from 'es-cookie'
import Prismic from 'prismic-javascript'
import md5 from 'tiny-hashes/md5'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

import {
  createPrismicContext,
  usePrismicPreviewBootstrap,
  UsePrismicPreviewBootstrapConfig,
  usePrismicPreviewContext,
} from '../src'

const createConfig = (): UsePrismicPreviewBootstrapConfig => ({
  linkResolver: (doc): string => `/${doc.id}`,
})

const nodeHelpers = createNodeHelpers({
  typePrefix: 'Prismic prefix',
  fieldPrefix: 'Prismic',
  createNodeId: (id) => md5(id),
  createContentDigest: (input) => md5(JSON.stringify(input)),
})

beforeEach(() => {
  clearAllCookies()
})

test('initial state', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const { result } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const state = result.current[0]

  expect(state.state).toBe('INIT')
  expect(state.error).toBeUndefined()
})

test('fails if not a preview session - cookie is not set', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current[1]

  act(() => {
    bootstrapPreview()
  })

  await waitForNextUpdate()

  const state = result.current[0]

  expect(state.state).toBe('FAILED')
  expect(state.error?.message).toMatch(/not a preview session/i)
})

test('fails if not for this repository', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()

  const token = createPreviewToken('not-this-repository')
  cookie.set(Prismic.previewCookie, token)

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewBootstrap(pluginOptions.repositoryName, config),
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current[1]

  act(() => {
    bootstrapPreview()
  })

  await waitForNextUpdate()

  const state = result.current[0]

  expect(state.state).toBe('FAILED')
  expect(state.error?.message).toMatch(/token is not for this repository/i)
})

test('fetches all repository documents and bootstraps context', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()
  const spy = jest.spyOn(Prismic, 'client')

  const queryResults = [
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
  ]
  const queryResultsNodes = queryResults.map((doc) =>
    nodeHelpers.createNodeFactory(doc.type)(doc),
  )

  // @ts-expect-error - Partial client provided
  spy.mockReturnValue({
    query: jest.fn().mockImplementation((_, options) =>
      options.page === 1
        ? Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(0, 2),
          })
        : Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(2),
          }),
    ),
  })

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(Prismic.previewCookie, token)

  const { result, waitForNextUpdate } = renderHook(
    () => {
      const context = usePrismicPreviewContext(pluginOptions.repositoryName)
      const bootstrap = usePrismicPreviewBootstrap(
        pluginOptions.repositoryName,
        config,
      )

      return { bootstrap, context }
    },
    { wrapper: Provider },
  )
  const bootstrapPreview = result.current.bootstrap[1]

  expect(result.current.bootstrap[0].state).toBe('INIT')

  act(() => {
    bootstrapPreview()
  })

  // TODO: Test for RESOLVING state. It may be changing too quickly in the test
  // to track the change. May need to artificially delay the query fn.
  //
  // await waitForValueToChange(() => result.current.bootstrap[0].state)
  // expect(result.current.bootstrap[0].state).toBe('RESOLVING')

  await waitForNextUpdate()

  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPED')
  expect(result.current.bootstrap[0].error).toBeUndefined()

  expect(result.current.context[0].isBootstrapped).toBe(true)
  expect(result.current.context[0].nodes).toEqual({
    [queryResultsNodes[0].id]: queryResultsNodes[0],
    [queryResultsNodes[1].id]: queryResultsNodes[1],
    [queryResultsNodes[2].id]: queryResultsNodes[2],
    [queryResultsNodes[3].id]: queryResultsNodes[3],
  })
})

test('fails if already bootstrapped', async () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const config = createConfig()
  const spy = jest.spyOn(Prismic, 'client')

  const queryResults = [
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
    createPrismicAPIDocument(),
  ]

  // @ts-expect-error - Partial client provided
  spy.mockReturnValue({
    query: jest.fn().mockImplementation((_, options) =>
      options.page === 1
        ? Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(0, 2),
          })
        : Promise.resolve({
            total_pages: 2,
            results: queryResults.slice(2),
          }),
    ),
  })

  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(Prismic.previewCookie, token)

  const { result, waitForNextUpdate } = renderHook(
    () => {
      const context = usePrismicPreviewContext(pluginOptions.repositoryName)
      const bootstrap = usePrismicPreviewBootstrap(
        pluginOptions.repositoryName,
        config,
      )

      return { bootstrap, context }
    },
    { wrapper: Provider },
  )

  expect(result.current.bootstrap[0].state).toBe('INIT')

  // Bootstrap the first time.
  act(() => {
    result.current.bootstrap[1]()
  })

  await waitForNextUpdate()

  expect(result.current.bootstrap[0].state).toBe('BOOTSTRAPPED')
  expect(result.current.bootstrap[0].error).toBeUndefined()

  // Bootstrap the second time.
  act(() => {
    result.current.bootstrap[1]()
  })

  await waitForNextUpdate()

  expect(result.current.bootstrap[0].state).toBe('FAILED')
  expect(result.current.bootstrap[0].error?.message).toMatch(
    /already been bootstrapped/i,
  )
})
