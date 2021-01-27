import { renderHook, act } from '@testing-library/react-hooks'

import { createPluginOptions } from './__testutils__/createPluginOptions'
import { clearAllCookies } from './__testutils__/clearAllCookies'

import { usePrismicPreviewAccessToken, createPrismicContext } from '../src'

beforeEach(() => {
  clearAllCookies()
})

test('returns the current access token', () => {
  const pluginOptions = createPluginOptions()
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }

  const { result } = renderHook(
    () => usePrismicPreviewAccessToken('qwerty'),
    options,
  )

  expect(result.current[0]).toBe(pluginOptions.accessToken)
})

test('access token is empty if not set', () => {
  const pluginOptions = createPluginOptions()
  pluginOptions.accessToken = undefined
  const Provider = createPrismicContext({ pluginOptions })
  const options = { wrapper: Provider }

  const { result } = renderHook(
    () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
    options,
  )

  expect(result.current[0]).toBeUndefined()
})

describe('set function', () => {
  test('sets access token in context', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      options,
    )

    expect(result.current[0]).toBe(pluginOptions.accessToken)

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken)
    })

    expect(result.current[0]).toBe(newAccessToken)
  })

  test('sets access token cookie by default', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      options,
    )

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken)
    })

    expect(document.cookie).toBe(
      `; gatsby-plugin-prismic-previews.qwerty.accessToken=${newAccessToken}`,
    )
  })

  test('does not set cookie if remember=false', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      options,
    )

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken, false)
    })

    expect(document.cookie).toBe('')
  })
})

describe('removeCookie function', () => {
  test('removes access token cookie if it is set', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    const Provider = createPrismicContext({ pluginOptions })
    const options = { wrapper: Provider }

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      options,
    )

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken)
    })

    expect(document.cookie).toBe(
      `; gatsby-plugin-prismic-previews.qwerty.accessToken=${newAccessToken}`,
    )

    act(() => {
      result.current[1].removeCookie()
    })

    expect(document.cookie).toBe('')
  })
})
