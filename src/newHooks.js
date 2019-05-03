import { useEffect, useState, useCallback } from 'react'
import { get, merge } from 'lodash-es'
import Prismic from 'prismic-javascript'
import { set as setCookie } from 'es-cookie'
import camelCase from 'camelcase'

import { normalizeBrowserFields } from './normalizeBrowser'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time minus image processing due to running in the
// browser. Instead, image nodes return their source URL.
export const useNewPreview = ({
  location,
  customType,
  linkResolver = () => {},
  htmlSerializer = () => {},
  fetchLinks = [],
  accessToken,
  repositoryName,
}) => {
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const [previewData, setPreviewData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [path, setPath] = useState('/')

  // Returns the UID associated with the current preview session and sets the
  // appropriate preview cookie from Prismic.
  const fetchPreviewUID = useCallback(
    async (token, api) => {
      const url = await api.previewSession(token, linkResolver, '/')
      return url === '/' ? 'home' : url.split('/').pop()
    },
    [linkResolver],
  )

  // Returns the raw preview data from Prismic's API.
  const fetchRawPreviewData = useCallback(
    async (uid, api) => await api.getByUID(customType, uid, { fetchLinks }),
    [customType, fetchLinks],
  )

  // Returns an object containing normalized Prismic Preview data. This data has
  // has the same shape as the queryable graphql data created by Gatsby at build time.
  const normalizePreviewData = useCallback(
    async rawPreviewData => {
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
    },
    [accessToken, fetchLinks, htmlSerializer, linkResolver, repositoryName],
  )

  // Allows for async/await syntax inside of useEffect().
  const asyncEffect = useCallback(
    async (setPreviewData, setLoading) => {
      const api = await Prismic.getApi(apiEndpoint, { accessToken })

      const searchParams = new URLSearchParams(location.search)
      const token = searchParams.get('token')

      const uid = await fetchPreviewUID(token, api)
      setCookie(Prismic.previewCookie, token) // TODO: write why

      const rawPreviewData = await fetchRawPreviewData(uid, api)
      const resolvedPath = linkResolver(rawPreviewData)

      const data = await normalizePreviewData(rawPreviewData)

      setPreviewData(data)
      setPath(resolvedPath)
      setLoading(false)
    },
    [
      accessToken,
      apiEndpoint,
      fetchPreviewUID,
      fetchRawPreviewData,
      linkResolver,
      location,
      normalizePreviewData,
    ],
  )

  useEffect(() => {
    asyncEffect(setPreviewData, setLoading)
  }, [])

  return { previewData, isLoading, path }
}

export const usePreviewData = (staticData, location) => {
  const previewData = location.state.previewData
    ? JSON.parse(location.state.previewData)
    : null

  const mergeStaticData = () => merge(staticData, previewData)

  const [mergedData] = useState(() => {
    if (!previewData) return staticData

    return mergeStaticData()
  })

  return mergedData
}
