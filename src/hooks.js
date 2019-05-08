import { useEffect, useState, useCallback } from 'react'
import {
  merge,
  compose,
  head,
  keys,
  has,
  isPlainObject,
  isFunction,
  camelCase,
} from 'lodash/fp'
import { set as setCookie } from 'es-cookie'
import Prismic from 'prismic-javascript'
import traverse from 'traverse'

import { normalizeBrowserFields } from './normalizeBrowser'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time minus image processing due to running in the
// browser. Instead, image nodes return their source URL.
export const usePrismicPreview = ({
  location,
  linkResolver = () => {},
  htmlSerializer = () => {},
  fetchLinks = [],
  accessToken,
  repositoryName,
}) => {
  if (
    !location ||
    !accessToken ||
    !repositoryName ||
    !isPlainObject(location) ||
    !isFunction(linkResolver)
  )
    throw new Error('Invalid hook parameters!. Check hook call.')

  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const [state, setState] = useState({
    previewData: null,
    path: null,
    isInvalid: false,
  })

  // Fetches raw preview data directly from Prismic via ID.
  const fetchRawPreviewData = useCallback(
    async id => {
      const api = await Prismic.getApi(apiEndpoint, { accessToken })

      return await api.getByID(id, { fetchLinks })
    },
    [accessToken, apiEndpoint, fetchLinks],
  )

  // Normalizes preview data using browser-compatible normalize functions.
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

  // Fetches and normalizes preview data from Prismic.
  const asyncEffect = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    const docID = searchParams.get('documentId')

    if (!token || !docID) {
      setState({
        ...state,
        isInvalid: true,
      })

      return
    }

    // Required to send preview cookie on all API requests on future routes.
    setCookie(Prismic.previewCookie, token)

    const rawPreviewData = await fetchRawPreviewData(docID)
    const path = linkResolver(rawPreviewData)
    const previewData = await normalizePreviewData(rawPreviewData)

    setState({
      ...state,
      path,
      previewData,
    })
  }, [
    fetchRawPreviewData,
    linkResolver,
    location.search,
    normalizePreviewData,
    state,
  ])

  useEffect(() => {
    asyncEffect()
  }, [])

  return state
}

// Helper function that merges Gatsby's static data with normalized preview data.
// If the custom types are the same, deep merge with static data.
// If the custom types are different, deeply replace any document in the static
// data that matches the preview document's ID.
export const mergePrismicPreviewData = ({ staticData, previewData }) => {
  if (!staticData) return undefined
  if (!previewData) return staticData

  const traversalMerge = ({ staticData, previewData, key }) => {
    const { data: previewDocData, id: previewId } = previewData[key]

    function handleNode(node) {
      if (isPlainObject(node) && has('id', node) && node.id === previewId) {
        this.update(
          merge(node, {
            data: previewDocData,
          }),
        )
      }
    }

    return traverse(staticData).map(handleNode)
  }

  const mergeStaticData = (staticData, previewData) => {
    const previewKey = compose(
      head,
      keys,
    )(previewData)

    if (!has(previewKey, staticData))
      return traversalMerge({ staticData, previewData, key: previewKey })

    return merge(staticData, previewData)
  }

  return mergeStaticData(staticData, previewData)
}
