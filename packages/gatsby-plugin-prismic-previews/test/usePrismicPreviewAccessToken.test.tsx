import { renderHook, act } from '@testing-library/react-hooks'

import { createPluginOptions } from './__testutils__/createPluginOptions'
import { clearAllCookies } from './__testutils__/clearAllCookies'

import { usePrismicPreviewAccessToken, PrismicPreviewProvider } from '../src'
import { setPluginOptionsOnWindow } from '../src/lib/setPluginOptionsOnWindow'

beforeEach(() => {
  clearAllCookies()
})

test('returns the current access token', () => {
  const pluginOptions = createPluginOptions()
  setPluginOptionsOnWindow(pluginOptions)

  const { result } = renderHook(
    () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
    { wrapper: PrismicPreviewProvider },
  )

  expect(result.current[0]).toBe(pluginOptions.accessToken)
})

test('access token is empty if not set', () => {
  const pluginOptions = createPluginOptions()
  pluginOptions.accessToken = undefined
  setPluginOptionsOnWindow(pluginOptions)

  const { result } = renderHook(
    () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
    { wrapper: PrismicPreviewProvider },
  )

  expect(result.current[0]).toBeUndefined()
})

describe('set function', () => {
  test('sets access token in context', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    setPluginOptionsOnWindow(pluginOptions)

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      { wrapper: PrismicPreviewProvider },
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
    setPluginOptionsOnWindow(pluginOptions)

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      { wrapper: PrismicPreviewProvider },
    )

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken)
    })

    expect(document.cookie).toBe(
      `; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
    )
  })

  test('does not set cookie if remember=false', () => {
    const pluginOptions = createPluginOptions()
    pluginOptions.accessToken = undefined
    setPluginOptionsOnWindow(pluginOptions)

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      { wrapper: PrismicPreviewProvider },
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
    setPluginOptionsOnWindow(pluginOptions)

    const { result } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      { wrapper: PrismicPreviewProvider },
    )

    const newAccessToken = 'newAccessToken'
    act(() => {
      result.current[1].set(newAccessToken)
    })

    expect(document.cookie).toBe(
      `; gatsby-plugin-prismic-previews.${pluginOptions.repositoryName}.accessToken=${newAccessToken}`,
    )

    act(() => {
      result.current[1].removeCookie()
    })

    expect(document.cookie).toBe('')
  })
})
