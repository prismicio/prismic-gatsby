import Prismic from 'prismic-javascript'
import uuidv5 from 'uuid/v5'
import md5 from 'md5'
import traverse from 'traverse'
import {
  camelCase,
  compose,
  has,
  head,
  isArray,
  isPlainObject,
  keys,
  mergeWith,
} from 'lodash/fp'

import { IS_BROWSER, GLOBAL_STORE_KEY } from '../constants'
import { documentToNodes } from '../documentToNodes'
import {
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
} from '../normalizers/browser'

const seedConstant = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`
const createNodeId = id =>
  uuidv5(id, uuidv5('gatsby-source-prismic', seedConstant))
const createContentDigest = obj => md5(JSON.stringify(obj))

const nodeStore = new Map()
const createNode = node => nodeStore.set(node.id, node)
const hasNodeById = id => nodeStore.has(id)
const getNodeById = id => nodeStore.get(id)

export const validateParameters = (location, pluginOptions) => {
  if (!location)
    throw new Error('Missing location. Provide a valid location object.')

  if (typeof location.search !== 'string')
    throw new Error('Invalid location. Provide a valid location object.')

  if (typeof pluginOptions.repositoryName !== 'string')
    throw new Error('Invalid repositoryName. Provide a valid repositoryName.')

  if (typeof pluginOptions.accessToken !== 'string')
    throw new Error('Invalid accessToken. Provide a valid accessToken.')

  if (typeof pluginOptions.linkResolver !== 'function')
    throw new Error('Invalid linkResolver. Provide a valid linkResolver.')

  if (
    pluginOptions.pathResolver &&
    typeof pluginOptions.pathResolver !== 'function'
  )
    throw new Error('Invalid pathResolver. Provide a valid pathResolver.')

  if (typeof pluginOptions.htmlSerializer !== 'function')
    throw new Error('Invalid htmlSerializer. Provide a valid htmlSerializer.')
}

// @private
// Returns global plugin options. Note: only plugin options that can be
// retained via JSON.stringify are provided.
export const getGlobalPluginOptions = repositoryName =>
  IS_BROWSER ? window[GLOBAL_STORE_KEY][repositoryName] : {}

// Returns preview data for a given document ID from Prismic.
export const fetchPreviewData = async (id, pluginOptions) => {
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const api = await Prismic.getApi(apiEndpoint, { accessToken })

  return api.getByID(id, { fetchLinks })
}

// Returns type paths JSON.
export const fetchTypePaths = async pluginOptions => {
  const { typePathsFilenamePrefix, schemasDigest } = pluginOptions

  const req = await fetch(`/${typePathsFilenamePrefix}${schemasDigest}.json`, {
    headers: { 'Content-Type': 'application/json' },
  })

  return await req.json()
}

export const normalizePreviewData = async (
  previewData,
  typePaths,
  pluginOptions,
) => {
  const rootNodeId = await documentToNodes(previewData, {
    typePaths,
    createNode,
    createNodeId,
    createContentDigest,
    hasNodeById,
    getNodeById,
    pluginOptions,
    normalizeImageField,
    normalizeLinkField,
    normalizeSlicesField,
    normalizeStructuredTextField,
  })

  const rootNode = nodeStore.get(rootNodeId)

  const prefixedType = camelCase(rootNode.internal.type)

  return {
    [prefixedType]: rootNode,
  }
}

// @private
// Function that is passed to lodash's mergeWith() to replace arrays during
// object merges instead of actually merging them. This fixes unintended behavior
// when merging repeater fields from previews.
const mergeCopyArrays = (obj, src) => {
  if (isArray(obj)) return src
}

// @private
// Returns a new object containing the traversally merged key-value
// pairs from previewData and staticData.
//
// We determine when to merge by comparingthe document id from previewData
// and replacing staticData's corresponding data object with
// the one from previewData.
const _traversalMerge = (staticData, previewData, key) => {
  const { data: previewDocData, id: previewId } = previewData[key]

  function handleNode(node) {
    if (isPlainObject(node) && has('id', node) && node.id === previewId) {
      this.update(
        mergeWith(mergeCopyArrays, node, {
          data: previewDocData,
        }),
      )
    }
  }

  return traverse(staticData).map(handleNode)
}

// @private
// Returns an object containing the merged contents of staticData
// and previewData based on the provided key.
//
// If the objects share the same top level key, perform a recursive
// merge. If the objects do not share the same top level key,
// traversally merge them.
const _mergeStaticData = (staticData, previewData) => {
  const previewKey = compose(
    head,
    keys,
  )(previewData)

  if (!has(previewKey, staticData))
    return _traversalMerge(staticData, previewData, previewKey)

  return mergeWith(mergeCopyArrays, staticData, previewData)
}

// Helper function that merges Gatsby's static data with normalized preview data.
// If the custom types are the same, deep merge with static data.
// If the custom types are different, deeply replace any document in the static
// data that matches the preview document's ID.
export const mergePrismicPreviewData = ({ staticData, previewData }) => {
  if (!staticData && !previewData)
    throw new Error(
      'Invalid data! Please provide at least staticData or previewData.',
    )
  if (!staticData) return previewData
  if (!previewData) return staticData

  return _mergeStaticData(staticData, previewData)
}
