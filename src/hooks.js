import { useEffect, useState, useCallback } from 'react'
import { set as setCookie } from 'es-cookie'
import Prismic from 'prismic-javascript'
import queryString from 'query-string'

import {
  validateParameters,
  getGlobalPluginOptions,
  fetchTypePaths,
  fetchPreviewData,
  normalizePreviewData,
} from './hook/helpers'

export { mergePrismicPreviewData } from './hook/helpers'

/**
 * @typedef {Object} pluginOptions
 * @property {string} repositoryName - Name of the Prismic repository to query.
 * @property {string} accessToken - API token to query the Prismic API.
 * @property {funcion} fetchLinks - Array of values that determines how Prismic fetches linked fields.
 * @property {function} linkResolver - Function for Prismic to resolve links in the queried document.
 *    @see {@link https://prismic.io/docs/javascript/beyond-the-api/link-resolving}
 * @property {function} htmlSerializer - Function that allows Prismic to preprocess rich text fields.
 *    @see {@link https://prismic.io/docs/javascript/beyond-the-api/html-serializer}
 * @property {string} typePathsFilenamePrefix - Prefix to the typePaths json we generate at build time.
 * @property {string} schemasDigest - Used for gatsby internals.
 * @property {string} pathResolver - Function that allows for custom preview page path resolving.
 */

/**
 * React hook providing preview data from Prismic identical in shape to the data
 * created at build time. Images are not processed due to running in the browser.
 * Instead, images reutrn their URL.
 * @public
 *
 * @param {Object} location - Location object from @reach/router.
 * @param {Object} pluginOptions - The {@link pluginOptions} for this preview.
 *
 * @returns An object containing normalized Prismic preview data directly from
 *    the Prismic API.
 */
export const usePrismicPreview = (location, pluginOptions = {}) => {
  const globalPluginOptions =
    getGlobalPluginOptions(pluginOptions.repositoryName) || {}
  pluginOptions = {
    schemasDigest: globalPluginOptions.schemasDigest,
    ...globalPluginOptions.pluginOptions,
    ...pluginOptions,
  }

  validateParameters(location, pluginOptions)
  const { token, documentId: docID } = queryString.parse(location.search)
  const [state, setState] = useState({ previewData: null, path: null })

  const asyncEffect = useCallback(async () => {
    // If not a preview, reset state and return early.
    if (!token || !docID) return

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
  }, [docID, pluginOptions, token])

  useEffect(() => {
    asyncEffect()
  }, [])

  return { ...state, isPreview: !token || !docID }
}
