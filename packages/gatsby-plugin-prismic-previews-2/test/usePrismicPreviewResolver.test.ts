import { renderHook, act } from '@testing-library/react-hooks'
import Prismic from 'prismic-javascript'
import { pipe } from 'fp-ts/function'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import {
  createPrismicContext,
  LinkResolver,
  usePrismicPreviewResolver,
  UsePrismicPreviewResolverConfig,
} from '../src'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'

const createConfig = (): UsePrismicPreviewResolverConfig => ({
  linkResolver: (doc): string => `/${doc.id}`,
})

beforeEach(() => {
  window.history.replaceState({}, '', '')
  clearAllCookies()
})

test('initial state', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )

  expect(result.current[0].state).toBe('INIT')
  expect(result.current[0].path).toBe(undefined)
  expect(result.current[0].error).toBe(undefined)
})

test('fails if documentId is not in URL', async () => {
  window.history.replaceState({}, '', '?token=token')

  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /documentId URL parameter not present/i,
  )
})

test('fails if token is not in URL', async () => {
  window.history.replaceState({}, '', '?documentId=documentId')

  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /token URL parameter not present/i,
  )
})

test('fails if token does not match repository', async () => {
  const pluginOptions = createPluginOptions()
  const token = encodeURIComponent(`https://no-match.prismic.io/previews/token`)

  window.history.replaceState({}, '', `?token=${token}&documentId=documentId`)

  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  resolvePreview()

  await waitForNextUpdate()

  expect(result.current[0].state).toBe('FAILED')
  expect(result.current[0].error?.message).toMatch(
    /token is not for this repository/i,
  )
})

// TODO: Clean up
test('resolves a path using the link resolver', async () => {
  const pluginOptions = createPluginOptions()
  const documentId = 'documentId'
  const token = encodeURIComponent(
    `https://${pluginOptions.repositoryName}.prismic.io/previews/token`,
  )

  window.history.replaceState(
    {},
    '',
    `?token=${token}&documentId=${documentId}`,
  )

  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }
  const config = createConfig()

  const spy = jest.spyOn(Prismic, 'client')
  // @ts-expect-error - Partial client provided
  spy.mockReturnValue({
    getPreviewResolver: jest.fn().mockImplementation((_token, documentId) => ({
      resolve: jest.fn().mockImplementation((linkResolver: LinkResolver) =>
        pipe(
          createPrismicAPIDocument(),
          (doc) => (doc.id = documentId) && doc,
          linkResolver,
          (path) => Promise.resolve(path),
        ),
      ),
    })),
  })

  const { result, waitForNextUpdate } = renderHook(
    () => usePrismicPreviewResolver(pluginOptions.repositoryName, config),
    options,
  )
  const resolvePreview = result.current[1]

  expect(result.current[0].state).toBe('INIT')

  act(() => {
    resolvePreview()
  })

  // TODO: Test for RESOLVING state. It may be changing to quickly in the test
  // to track the change. May need to artificially delay the preview resolver
  // spy.
  //
  // await waitForValueToChange(() => result.current[0].state)
  // expect(result.current[0].state).toBe('RESOLVING')

  await waitForNextUpdate()

  expect(result.current[0].error).toBeUndefined()
  expect(result.current[0].state).toBe('RESOLVED')
  expect(result.current[0].path).toBe(`/${documentId}`)
})
