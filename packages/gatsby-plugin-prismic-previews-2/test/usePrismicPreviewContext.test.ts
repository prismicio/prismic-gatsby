import { renderHook, act } from '@testing-library/react-hooks'

import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPrismicAPIDocumentNodeInput } from './__testutils__/createPrismicAPIDocumentNodeInput'
import { clearAllCookies } from './__testutils__/clearAllCookies'

import {
  usePrismicPreviewContext,
  createPrismicContext,
  PrismicContextActionType,
  usePrismicPreviewAccessToken,
} from '../src'

beforeEach(() => {
  clearAllCookies()
})

test('throws if context does not exist for repository', () => {
  const { result } = renderHook(() =>
    usePrismicPreviewContext('non-existent-repo'),
  )

  expect(result.error?.message).toMatch(/could not find/i)
})

test('returns context for repository', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }

  const { result } = renderHook(
    () => usePrismicPreviewContext(pluginOptions.repositoryName),
    options,
  )

  const context = result.current[0]

  expect(context.repositoryName).toBe(pluginOptions.repositoryName)
  expect(context.pluginOptions).toEqual(pluginOptions)
  expect(context.nodes).toEqual({})
  expect(context.typePaths).toEqual({})
  // TODO: Remove once path-to-nodes map is created (to be used with unpublished previews)
  expect(context.rootNodeMap).toEqual({})
  expect(context.isBootstrapped).toBe(false)
})

test('initial state contains access token if persisted in cookie', () => {
  const pluginOptions = createPluginOptions()
  pluginOptions.accessToken = undefined

  const persistedAccessToken = 'persistedAccessToken'
  const { result: accessTokenResult } = renderHook(() =>
    usePrismicPreviewAccessToken(pluginOptions.repositoryName),
  )
  act(() => {
    accessTokenResult.current[1].set(persistedAccessToken, true)
  })

  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }

  const { result } = renderHook(
    () => usePrismicPreviewContext(pluginOptions.repositoryName),
    options,
  )

  expect(result.current[0].pluginOptions.accessToken).toBe(persistedAccessToken)
})

describe('actions', () => {
  test('SetAccessToken sets the access token', () => {
    const pluginOptions = createPluginOptions()
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewContext(pluginOptions.repositoryName),
      options,
    )
    const dispatch = result.current[1]

    const newAccessToken = 'newAccessToken'
    act(() => {
      dispatch({
        type: PrismicContextActionType.SetAccessToken,
        payload: newAccessToken,
      })
    })

    const context = result.current[0]

    expect(context.pluginOptions.accessToken).toBe(newAccessToken)
  })

  test('AppendNodes adds nodes', () => {
    const pluginOptions = createPluginOptions()
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewContext(pluginOptions.repositoryName),
      options,
    )
    const dispatch = result.current[1]

    const nodeInputs = [
      createPrismicAPIDocumentNodeInput(),
      createPrismicAPIDocumentNodeInput(),
    ]

    act(() => {
      dispatch({
        type: PrismicContextActionType.AppendNodes,
        payload: nodeInputs,
      })
    })

    const context = result.current[0]

    expect(context.nodes).toEqual({
      [nodeInputs[0].id]: nodeInputs[0],
      [nodeInputs[1].id]: nodeInputs[1],
    })
  })

  test('Bootstrapped marks repository as bootstrapped', () => {
    const pluginOptions = createPluginOptions()
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewContext(pluginOptions.repositoryName),
      options,
    )
    const dispatch = result.current[1]

    expect(result.current[0].isBootstrapped).toBe(false)

    act(() => {
      dispatch({ type: PrismicContextActionType.Bootstrapped })
    })

    expect(result.current[0].isBootstrapped).toBe(true)
  })
})
