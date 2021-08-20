import test from 'ava'
import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import browserEnv from 'browser-env'
import * as mock from '@prismicio/mock'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'

import {
  PrismicContextActionType,
  PrismicPreviewProvider,
  usePrismicPreviewAccessToken,
  usePrismicPreviewContext,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

test.before(() => {
  browserEnv(['window', 'document'])
  window.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0)
  }
})
test.beforeEach(() => {
  clearAllCookies()
})
test.afterEach(() => {
  cleanup()
})

test.serial('returns context with repository options', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(() => usePrismicPreviewContext(), {
    wrapper: PrismicPreviewProvider,
  })

  const context = result.current[0]

  t.true(context.isBootstrapped === false)
  t.deepEqual(context.pluginOptionsStore, {
    [pluginOptions.repositoryName]: pluginOptions,
  })
})

test.serial(
  'initial state contains access token if persisted in cookie',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    pluginOptions.accessToken = undefined

    const persistedAccessToken = 'persistedAccessToken'

    // @ts-expect-error - Partial gatsbyContext provided
    await onClientEntry(gatsbyContext, pluginOptions)

    const { result: accessTokenResult } = renderHook(
      () => usePrismicPreviewAccessToken(pluginOptions.repositoryName),
      { wrapper: PrismicPreviewProvider },
    )
    act(() => {
      accessTokenResult.current[1].set(persistedAccessToken, true)
    })

    const { result } = renderHook(() => usePrismicPreviewContext(), {
      wrapper: PrismicPreviewProvider,
    })

    t.true(
      result.current[0].pluginOptionsStore[pluginOptions.repositoryName]
        .accessToken === persistedAccessToken,
    )
  },
)

test.serial('SetAccessToken action sets the access token', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(() => usePrismicPreviewContext(), {
    wrapper: PrismicPreviewProvider,
  })
  const dispatch = result.current[1]

  const newAccessToken = 'newAccessToken'
  act(() => {
    dispatch({
      type: PrismicContextActionType.SetAccessToken,
      payload: {
        repositoryName: pluginOptions.repositoryName,
        accessToken: newAccessToken,
      },
    })
  })

  const context = result.current[0]

  t.true(
    context.pluginOptionsStore[pluginOptions.repositoryName].accessToken ===
      newAccessToken,
  )
})

test.serial('AppendDocuments action adds documents', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)

  // @ts-expect-error - Partial gatsbyContext provided
  await onClientEntry(gatsbyContext, pluginOptions)
  const { result } = renderHook(() => usePrismicPreviewContext(), {
    wrapper: PrismicPreviewProvider,
  })

  act(() => {
    const dispatch = result.current[1]

    dispatch({
      type: PrismicContextActionType.SetupRuntime,
      payload: {
        repositoryName: pluginOptions.repositoryName,
        config: {},
      },
    })
  })

  const model = mock.model.customType()
  const documents = [
    mock.value.document({ model }),
    mock.value.document({ model }),
  ]
  result.current[0].runtimeStore[
    pluginOptions.repositoryName
  ].registerCustomTypeModels([model])

  act(() => {
    const dispatch = result.current[1]

    dispatch({
      type: PrismicContextActionType.AppendDocuments,
      payload: { repositoryName: pluginOptions.repositoryName, documents },
    })
  })

  const context = result.current[0]

  t.deepEqual(
    context.runtimeStore[pluginOptions.repositoryName].nodes.map(
      (node) => node.prismicId,
    ),
    documents.map((document) => document.id),
  )
})

test.serial(
  'Bootstrapped action marks repository as bootstrapped',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)

    // @ts-expect-error - Partial gatsbyContext provided
    await onClientEntry(gatsbyContext, pluginOptions)
    const { result } = renderHook(() => usePrismicPreviewContext(), {
      wrapper: PrismicPreviewProvider,
    })
    const dispatch = result.current[1]

    t.true(result.current[0].isBootstrapped === false)

    act(() => {
      dispatch({ type: PrismicContextActionType.Bootstrapped })
    })

    t.true(result.current[0].isBootstrapped)
  },
)
