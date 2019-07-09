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
  isFunction,
  noop,
} from 'lodash/fp'
import {
  array as yupArray,
  mixed as yupMixed,
  object as yupObject,
  string as yupString,
} from 'yup'

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
 * Validates parameters sent to our hook.
 * @private
 *
 * @param {Object} location - Location object from `@reach/router`
 * @param {Object} pluginOptions - The {@link pluginOptions} to validate.
 *
 * @throws When `location` or `pluginOptions` are not valid.
 */
export const validateParameters = (location, pluginOptions) => {
  const locationSchema = yupObject().shape({
    search: yupString()
      .nullable()
      .required('Missing location. Please pass the location object.'),
  })

  const pluginOptionsSchema = yupObject().shape({
    repositoryName: yupString()
      .nullable()
      .required('Invalid Repository Name.'),
    accessToken: yupString()
      .nullable()
      .required('Invalid access token.'),
    fetchLinks: yupArray()
      .of(yupString().required())
      .default([]),
    linkResolver: yupMixed()
      .test('is function', '${path} is not a function', isFunction)
      .required(),
    htmlSerializer: yupMixed()
      .test('is function', '${path} is not a function', isFunction)
      .required(),
    typePathsFilenamePrefix: yupString()
      .nullable()
      .required('Invalid typePaths filename prefix.'),
    schemasDigest: yupString()
      .nullable()
      .required('Invalid Schemas digest.'),
    pathResolver: yupMixed()
      .test('is function', '${path} is not a function', isFunction)
      .default(() => noop),
  })

  locationSchema.validateSync(location)
  pluginOptionsSchema.validateSync(pluginOptions)
}

/**
 * Retrieves plugin options from `window`.
 * @private
 *
 * @param {string} repositoryName - Name of the repository.
 * @returns Global plugin options. Only plugin options that can be serialized
 * by JSON.stringify() are provided.
 */
export const getGlobalPluginOptions = repositoryName =>
  IS_BROWSER ? window[GLOBAL_STORE_KEY][repositoryName] : {}

/**
 * Fetches raw Prismic preview document data from their api.
 * @private
 *
 * @param {string} id - ID of the prismic document to preview.
 * @param {Object} pluginOptions - The {@link pluginOptions} to fetch preview data with.
 *
 * @returns Raw preview data object from Prismic.
 */
export const fetchPreviewData = async (id, pluginOptions) => {
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  const apiEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
  const api = await Prismic.getApi(apiEndpoint, { accessToken })

  return api.getByID(id, { fetchLinks })
}

/**
 * Retrieves the typePaths definition file that we create at build time to also normalize our types in the browser.
 * @private
 *
 * @param {Object} pluginOptions - The {@link pluginOptions} to get our type paths file name from
 * @returns The typePaths JSON object for use when normalizing data in the browser.
 */
export const fetchTypePaths = async pluginOptions => {
  const { typePathsFilenamePrefix, schemasDigest } = pluginOptions

  const req = await fetch(`/${typePathsFilenamePrefix}${schemasDigest}.json`, {
    headers: { 'Content-Type': 'application/json' },
  })

  return await req.json()
}

/**
 * Normalizes a preview response from Prismic to be the same shape as what is generated at build time.
 * @private
 *
 * @param {Object} previewData - previewData from `fetchPreviewData()` @see {@link fetchPreviewData} for more info.
 * @param {Object} typePaths - typePaths from `fetchTypePaths()` @see {@link fetchTypePaths} for more info.
 * @param {Object} pluginOptions - The {@link pluginOptions} to use when normalizing and fetching data.
 */
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

/**
 * Function that is passed to lodash's `mergeWith()` to replace arrays during object merges instead of
 * actually merging them. This fixes unintended behavior when merging repeater fields from previews.
 * @private
 *
 * @param {Object} obj - Object being merged.
 * @param {Object} src - Source object being merge.
 *
 * @returns src when obj is an Array.
 */
const mergeCopyArrays = (obj, src) => {
  if (isArray(obj)) return src
}

/**
 * Traversally merges key-value pairs.
 * @private
 *
 * @param {Object} staticData - Static data generated at buildtime.
 * @param {Object} previewData - Normalized preview data. @see {@link normalizePreviewData} for more info.
 * @param {String} key - Key that determines the preview data type to replace inside static data.
 *
 * @returns A new object containing the traversally merged key-value pairs from `previewData` and `staticData`
 */
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

/**
 * Merges static and preview data objects together. If the objects share the same top level key, perform
 * a recursive merge. If the objects do not share the same top level key, traversally merge them.
 * @private
 *
 * @param {Object} staticData - Static data generated at buildtime.
 * @param {Object} previewData - Normalized preview data. @see {@link normalizePreviewData} for more info.
 *
 * @returns Object containing the merge contents of staticData and previewData.
 */
const _mergeStaticData = (staticData, previewData) => {
  const previewKey = compose(
    head,
    keys,
  )(previewData)

  if (!has(previewKey, staticData))
    return _traversalMerge(staticData, previewData, previewKey)

  return mergeWith(mergeCopyArrays, staticData, previewData)
}

/**
 * Helper that merge's Gatsby's static data with normalized preview data.
 * If the custom types are the same, deep merge with static data.
 * If the custom types are different, deeply replace any document in the static data that matches the preivew document's ID.
 * @public
 *
 * @param {Object} data - Data to merge.
 * @param data.staticData - Static data from Gatsby.
 * @param data.previewData - Preview data from `usePrismicPreview()`.
 *
 * @returns An object containing the merged contents of previewData and staticData.
 */
export const mergePrismicPreviewData = ({ staticData, previewData }) => {
  if (!staticData && !previewData)
    throw new Error(
      'Invalid data! Please provide at least staticData or previewData.',
    )
  if (!staticData) return previewData
  if (!previewData) return staticData

  return _mergeStaticData(staticData, previewData)
}
