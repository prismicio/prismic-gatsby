import { useEffect, useState, useCallback } from 'react'
import { merge } from 'lodash-es'
import Prismic from 'prismic-javascript'
import { set as setCookie } from 'es-cookie'
import camelCase from 'camelcase'

import { normalizeBrowserFields } from './normalizeBrowser'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'

// TODO refactor to single useState to prevent re-rendering

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time minus image processing due to running in the
// browser. Instead, image nodes return their source URL.
export const useNewPreview = ({
  location,
  linkResolver = () => {},
  htmlSerializer = () => {},
  fetchLinks = [],
  accessToken,
  repositoryName,
}) => {
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const [previewData, setPreviewData] = useState(null)
  const [path, setPath] = useState(null)

  // Returns the raw preview data from Prismic's API.
  const fetchRawPreviewData = useCallback(
    async id => {
      const api = await Prismic.getApi(apiEndpoint, { accessToken })

      return await api.getByID(id, { fetchLinks })
    },
    [accessToken, apiEndpoint, fetchLinks],
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
  const asyncEffect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    const docID = searchParams.get('documentId')

    setCookie(Prismic.previewCookie, token) // TODO: write why

    const rawPreviewData = await fetchRawPreviewData(docID)
    const resolvedPath = linkResolver(rawPreviewData)

    const data = await normalizePreviewData(rawPreviewData)

    setPreviewData(data)
    setPath(resolvedPath)
  }, [fetchRawPreviewData, linkResolver, location.search, normalizePreviewData])

  useEffect(() => {
    asyncEffect()
  }, [])

  return { previewData, path }
}

export const usePreviewData = (staticData, location) => {
  const previewData = location.state
    ? JSON.parse(location.state.previewData)
    : null

  const mergeStaticData = () => merge(staticData, previewData)

  const [mergedData] = useState(() => {
    if (!previewData) return staticData

    return mergeStaticData()
  })

  return mergedData
}
