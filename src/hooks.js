/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react'
import Prismic from 'prismic-javascript'
import qs from 'qs'
import { set as setCookie } from 'es-cookie'
import camelCase from 'camelcase'

import { normalizeBrowserFields } from './normalizeBrowser'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time minus image processing due to running in the
// browser. Instead, image nodes return their source URL.
export const usePrismicPreview = ({
  location,
  customType,
  linkResolver = () => {},
  htmlSerializer = () => {},
  fetchLinks = [],
  accessToken,
  repositoryName,
}) => {
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`

  // Hook helpers:

  // Returns the UID associated with the current preview session and sets the
  // appropriate preview cookie from Prismic.
  const fetchPreviewUID = async (token, api) => {
    const url = await api.previewSession(token, linkResolver, '/')
    return url === '/' ? 'home' : url.split('/').pop()
  }

  // Returns the raw preview data from Prismic's API.
  const fetchRawPreviewData = async (uid, api) =>
    await api.getByUID(customType, uid, { fetchLinks })

  // Returns an object containing normalized Prismic Preview data. This data has
  // has the same shape as the queryable graphql data created by Gatsby at build time.
  const normalizePreviewData = async rawPreviewData => {
    const Node = createNodeFactory(rawPreviewData.type, async node => {
      node.data = await normalizeBrowserFields({
        value: node.data,
        node,
        linkResolver,
        htmlSerializer,
        fetchLinks,
        shouldNormalizeImage: () => true,
        nodeHelpers,
        repositoryName,
        accessToken,
      })

      return node
    })

    const node = await Node(rawPreviewData)
    const prefixedType = camelCase(node.internal.type)

    return {
      [prefixedType]: node,
    }
  }

  // Allows for async/await syntax inside of useEffect().
  const asyncEffect = async (setPreviewData, setLoading) => {
    const api = await Prismic.getApi(apiEndpoint, { accessToken })

    const { token } = qs.parse(location.search.slice(1))
    const uid = await fetchPreviewUID(token, api)
    setCookie(Prismic.previewCookie, token) // TODO: write why

    const rawPreviewData = await fetchRawPreviewData(uid, api)
    const data = await normalizePreviewData(rawPreviewData)

    setPreviewData(data)
    setLoading(false)
  }

  const [previewData, setPreviewData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(
    () => {
      asyncEffect(setPreviewData, setLoading)
    },
    [asyncEffect],
  )

  return { previewData, isLoading }
}
