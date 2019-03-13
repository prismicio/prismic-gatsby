import { useEffect, useState } from 'react'
import Prismic from 'prismic-javascript'
import qs from 'qs'
import * as Cookies from 'es-cookie'
import camelCase from 'camelcase'

import { normalizeBrowserFields } from './normalizeBrowser'
import { nodeHelpers, createNodeFactory } from './nodeHelpers'

// Returns an object containing normalized Prismic preview data directly from
// the Prismic API. The normalized data object's shape is identical to the shape
// created by Gatsby at build time, minus image processing due to running in the
// browser.
export const usePrismicPreview = ({
  location,
  customType = 'page',
  linkResolver = doc => doc.uid,
  htmlSerializer = () => {},
  fetchLinks = [],
  repositoryName,
  accessToken,
}) => {
  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`

  // Hook helper functions:

  // Returns the UID associated with the current preview session and sets the
  // appropriate preview cookie from Prismic.
  const getPreviewUID = async () => {
    try {
      const params = qs.parse(location.search.slice(1))
      const api = await Prismic.getApi(apiEndpoint, { accessToken })
      const url = await api.previewSession(params.token, linkResolver, '/')
      const uid = url === '/' ? 'home' : url.split('/').pop()
      Cookies.set(Prismic.previewCookie, params.token)

      return { uid, api }
    } catch (error) {
      console.error('Error fetching Prismic preview UID: ', error)

      return false
    }
  }

  // Returns the raw preview data from Prismic's API.
  const getRawPreviewData = async () => {
    try {
      const { uid, api } = await getPreviewUID()

      return await api.getByUID(customType, uid, { fetchLinks })
    } catch (error) {
      console.error('Error fetching Prismic preview data: ', error)

      return false
    }
  }

  // Returns an object containing normalized Prismic Preview data. This data has
  // has the same shape as the queryable graphql data created by Gatsby at build time.
  const normalizePreviewData = async () => {
    const doc = await getRawPreviewData()

    const Node = createNodeFactory(doc.type, async node => {
      node.data = await normalizeBrowserFields({
        value: node.data,
        node,
        linkResolver: () => linkResolver,
        htmlSerializer: () => htmlSerializer,
        nodeHelpers,
        shouldNormalizeImage: () => true,
        repositoryName,
        accessToken,
        fetchLinks,
        fetchedIds: [],
      })

      return node
    })

    const node = await Node(doc)
    const prefixedType = camelCase(node.internal.type)

    // Reconstruct the node's body to match how Gatsby reconstructs it at build
    // time.
    const sliceBody = node.data.body.map(slice => ({
      id: slice.id,
      primary: slice.primary,
      items: slice.items,
      __typename: slice.internal.type,
    }))

    return {
      [prefixedType]: {
        data: {
          ...node.data,
          body: sliceBody,
        },
        uid: node.uid,
      },
    }
  }

  // Allows for async/await syntax inside of useEffect().
  const asyncEffect = async (setPreviewData, setLoading) => {
    const data = await normalizePreviewData(location)
    setPreviewData(data)
    setLoading(false)
  }

  const [previewData, setPreviewData] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    asyncEffect(setPreviewData, setLoading)
  }, [])

  return { previewData, isLoading }
}
