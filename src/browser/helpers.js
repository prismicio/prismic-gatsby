import Prismic from 'prismic-javascript'
import uuidv5 from 'uuid/v5'
import md5 from 'md5'
import traverse from 'traverse'
import camelCase from 'camelcase'
import mergeWith from 'lodash.mergewith'
import {
  array as yupArray,
  mixed as yupMixed,
  object as yupObject,
  string as yupString,
} from 'yup'

import { IS_BROWSER, GLOBAL_STORE_KEY } from '../common/constants'
import { documentToNodes } from '../common/documentToNodes'
import { isFunction } from '../common/utils'
import {
  normalizeImageField,
  normalizeLinkField,
  normalizeSlicesField,
  normalizeStructuredTextField,
} from './normalizers'

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
 * Validates location sent to our hook.
 * @private
 *
 * @param {Object} rawLocation - Location object from `@reach/router`
 *
 * @throws When `location is not valid.
 */
export const validateLocation = rawLocation => {
  const schema = yupObject().shape({
    search: yupString().nullable(),
    ancestorOrigins: yupObject()
      .notRequired()
      .nullable(),
    assign: yupMixed()
      .notRequired()
      .nullable(),
    hash: yupString()
      .notRequired()
      .nullable(),
    host: yupString()
      .notRequired()
      .nullable(),
    hostname: yupString()
      .notRequired()
      .nullable(),
    href: yupString()
      .notRequired()
      .nullable(),
    key: yupString()
      .notRequired()
      .nullable(),
    origin: yupString()
      .notRequired()
      .nullable(),
    pathname: yupString()
      .notRequired()
      .nullable(),
    port: yupString()
      .notRequired()
      .nullable(),
    protocol: yupString()
      .notRequired()
      .nullable(),
    reload: yupMixed()
      .notRequired()
      .nullable(),
    replace: yupMixed()
      .notRequired()
      .nullable(),
    state: yupObject()
      .notRequired()
      .nullable(),
    toString: yupMixed()
      .notRequired()
      .nullable(),
  })

  return schema.validateSync(rawLocation)
}

/**
 * Validates plugin options sent to our hook.
 * @private
 *
 * @param {Object} rawPluginOptions - The {@link pluginOptions} to validate.
 *
 * @throws When `pluginOptions` are not valid.
 */
export const validatePluginOptions = rawPluginOptions => {
  const schema = yupObject().shape({
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
      .default(() => () => {}),
    htmlSerializer: yupMixed()
      .test('is function', '${path} is not a function', isFunction)
      .default(() => () => {}),
    typePathsFilenamePrefix: yupString()
      .nullable()
      .required('Invalid typePaths filename prefix.'),
    schemasDigest: yupString()
      .nullable()
      .required('Invalid Schemas digest.'),
    pathResolver: yupMixed()
      .nullable()
      .test(
        'is function',
        '${path} is not a function',
        value => value === undefined || isFunction(value),
      ),
    shouldNormalizeImage: yupMixed()
      .notRequired()
      .nullable(),
    lang: yupString()
      .notRequired()
      .nullable(),
    plugins: yupArray()
      .notRequired()
      .nullable(),
  })

  return schema.validateSync(rawPluginOptions)
}

/**
 * Retrieves plugin options from `window`.
 * @private
 *
 * @param {string} repositoryName - Name of the repository.
 * @returns Global plugin options. Only plugin options that can be serialized
 * by JSON.stringify() are provided.
 */
export const getGlobalPluginOptions = repositoryName => {
  return IS_BROWSER ? (window[GLOBAL_STORE_KEY] || {})[repositoryName] : {}
}
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
  const client = await Prismic.getApi(apiEndpoint, { accessToken })

  return client.getByID(id, { fetchLinks })
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
const mergeCopyArrays = (obj, src) => (Array.isArray(obj) ? src : undefined)

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
    if (typeof node === 'object' && node.id === previewId) {
      this.update(mergeWith(node, { data: previewDocData }, mergeCopyArrays))
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
  const previewKey = Object.keys(previewData)[0]

  if (!staticData.hasOwnProperty(previewKey))
    return _traversalMerge(staticData, previewData, previewKey)

  return mergeWith(staticData, previewData, mergeCopyArrays)
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
