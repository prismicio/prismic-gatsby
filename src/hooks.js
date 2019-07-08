import { useEffect, useState, useCallback } from 'react'
import { set as setCookie } from 'es-cookie'
import Prismic from 'prismic-javascript'
import { decode as qsDecode } from 'querystring'

import {
  validateParameters,
  getGlobalPluginOptions,
  fetchTypePaths,
  fetchPreviewData,
  normalizePreviewData,
} from './hook/helpers'

export { mergePrismicPreviewData } from './hook/helpers'

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time minus image processing due to running in the
// browser. Instead, image nodes return their source URL.
export const usePrismicPreview = (location, pluginOptions = {}) => {
  const globalPluginOptions =
    getGlobalPluginOptions(pluginOptions.repositoryName) || {}
  pluginOptions = {
    schemasDigest: globalPluginOptions.schemasDigest,
    ...globalPluginOptions.pluginOptions,
    ...pluginOptions,
  }

  validateParameters(location, pluginOptions)

  const [isPreview, setIsPreview] = useState(null)
  const [state, setState] = useState({ previewData: null, path: null })

  const asyncEffect = useCallback(async () => {
    const { token, docID } = qsDecode(location.search)

    // If not a preview, reset state and return early.
    if (!token || !docID) return setIsPreview(false)

    setState({ previewData: null, path: null })
    setIsPreview(true)

    // Required to send preview cookie on all API requests on future routes.
    setCookie(Prismic.previewCookie, token)

    const rawPreviewData = await fetchPreviewData(docID, pluginOptions)
    const typePaths = await fetchTypePaths(pluginOptions)
    const normalizedPreviewData = await normalizePreviewData(
      rawPreviewData,
      typePaths,
      pluginOptions,
    )

    const pathResolver =
      pluginOptions.pathResolver || pluginOptions.linkResolver

    setState({
      previewData: normalizedPreviewData,
      path: pathResolver({})(normalizedPreviewData),
    })
  }, [location.search, pluginOptions])

  useEffect(() => {
    asyncEffect()
  }, [])

  return { ...state, isPreview }
}
