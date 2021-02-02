import {
  Link as PrismicDOMLink,
  RichText as PrismicDOMRichText,
} from 'prismic-dom'
import { buildImgixFixed, buildImgixFluid } from 'gatsby-plugin-imgix'
import { v5 as uuidv5 } from 'uuid'
import md5 from 'md5'

import { createClient } from './api'
import { documentToNodes } from './documentsToNodes'
import { buildSchemaTypeName } from './utils'
import { UUID_NAMESPACE, PLACEHOLDER_NODE_TYPE_SUFFIX } from './constants'

import { NodeInput } from 'gatsby'
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi'
import {
  BrowserPluginOptions,
  DocumentsToNodesEnvironment,
  DocumentsToNodesEnvironmentBrowserContext,
  HTMLSerializer,
  ImageFieldNormalizer,
  LinkField,
  LinkFieldNormalizer,
  LinkFieldType,
  LinkResolver,
  NormalizedLinkField,
  SlicesFieldNormalizer,
  StructuredTextFieldNormalizer,
  TypePath,
  NodeID,
} from './types'

interface UnbrokenDocumentLinkField extends LinkField {
  link_type: LinkFieldType.Document
  id: string
  isBroken: false
}

const loadLinkFieldDocument = async (
  field: UnbrokenDocumentLinkField,
  env: DocumentsToNodesEnvironment,
) => {
  const {
    createNode,
    createNodeId,
    createContentDigest,
    pluginOptions,
    context,
  } = env
  if (field.link_type !== LinkFieldType.Document || !field.id || field.isBroken)
    return

  const { hasNodeById } = context as DocumentsToNodesEnvironmentBrowserContext
  const { repositoryName, accessToken, fetchLinks } = pluginOptions

  const linkedDocId = createNodeId(field.id)

  // Skip the fetch process if the node already exists in the store.
  if (hasNodeById(linkedDocId)) return

  // Create a placeholder node in the store to prevent infinite recursion. This
  // placeholder will be replaced with the actual node during the
  // `documentToNodes` call.
  createNode({
    id: linkedDocId,
    internal: {
      type: buildSchemaTypeName(field.type!) + PLACEHOLDER_NODE_TYPE_SUFFIX,
      contentDigest: createContentDigest(linkedDocId),
    },
  })

  const queryOptions: QueryOptions = {}
  if (fetchLinks) queryOptions.fetchLinks = fetchLinks

  // Query Prismic's API for the document.
  const client = await createClient(repositoryName, accessToken)
  const doc = await client.getByID(field.id, queryOptions)

  await documentToNodes(doc, env)
}

const normalizeImageField: ImageFieldNormalizer = async (
  _apiId,
  field,
  _path,
  _doc,
  env,
) => {
  const { pluginOptions } = env

  const url = field.url
  if (!url) return field

  const fixed = buildImgixFixed({
    url,
    sourceWidth: field.dimensions!.width,
    sourceHeight: field.dimensions!.height,
    args: {
      imgixParams: pluginOptions.imageImgixParams,
      placeholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
    },
  })

  const fluid = buildImgixFluid({
    url,
    sourceWidth: field.dimensions!.width,
    sourceHeight: field.dimensions!.height,
    args: {
      imgixParams: pluginOptions.imageImgixParams,
      placeholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
    },
  })

  return { ...field, fixed, fluid }
}

// TODO: Abstract proxy handler for any `getNodeById` needs (e.g. Slices).
const normalizeLinkField: LinkFieldNormalizer = async (
  apiId,
  field,
  _path,
  doc,
  env,
) => {
  const { createNodeId, pluginOptions, context } = env
  const { getNodeById } = context as DocumentsToNodesEnvironmentBrowserContext
  const { linkResolver } = pluginOptions

  let linkResolverForField: LinkResolver | undefined = undefined
  if (linkResolver)
    linkResolverForField = linkResolver({
      key: apiId,
      value: field,
      node: doc,
    })

  let linkedDocId: NodeID | undefined = undefined
  if (field && field.link_type === LinkFieldType.Document && field.id)
    linkedDocId = createNodeId(field.id)

  if (
    field &&
    field.link_type === LinkFieldType.Document &&
    field.id &&
    !field.isBroken
  )
    await loadLinkFieldDocument(field as UnbrokenDocumentLinkField, env)

  return new Proxy(
    {
      ...field,
      url: PrismicDOMLink.url(field, linkResolverForField),
      document: linkedDocId,
      raw: field,
    },
    {
      get: (obj, prop: keyof NormalizedLinkField) => {
        if (prop === 'document') {
          if (
            field &&
            field.link_type === LinkFieldType.Document &&
            !field.isBroken &&
            linkedDocId
          )
            return getNodeById(linkedDocId)

          return null
        }

        return obj[prop]
      },
    },
  )
}

const normalizeSlicesField: SlicesFieldNormalizer = (
  _apiId,
  field,
  _path,
  _doc,
  env,
) => {
  const { context } = env
  const {
    hasNodeById,
    getNodeById,
  } = context as DocumentsToNodesEnvironmentBrowserContext

  return new Proxy(field, {
    get: (obj, prop: number) => {
      const id = obj[prop]

      if (hasNodeById(id)) {
        const node = getNodeById(id)
        return { ...node, __typename: node.internal.type }
      }

      return id
    },
  })
}

const normalizeStructuredTextField: StructuredTextFieldNormalizer = async (
  apiId,
  field,
  _path,
  doc,
  env,
) => {
  const { pluginOptions } = env
  const { linkResolver, htmlSerializer } = pluginOptions

  let linkResolverForField: LinkResolver | undefined = undefined
  if (linkResolver)
    linkResolverForField = linkResolver({
      key: apiId,
      value: field,
      node: doc,
    })

  let htmlSerializerForField: HTMLSerializer | undefined = undefined
  if (htmlSerializer)
    htmlSerializerForField = htmlSerializer({
      key: apiId,
      value: field,
      node: doc,
    })

  return {
    html: PrismicDOMRichText.asHtml(
      field,
      linkResolverForField,
      htmlSerializerForField,
    ),
    text: PrismicDOMRichText.asText(field),
    raw: field,
  }
}

export const createEnvironment = (
  pluginOptions: BrowserPluginOptions,
  typePaths: TypePath[],
): DocumentsToNodesEnvironment => {
  const nodeStore = new Map()

  const createNode = (node: NodeInput) => void nodeStore.set(node.id, node)
  const createNodeId = (input: string) => uuidv5(input, UUID_NAMESPACE)
  const createContentDigest = (input: unknown) => md5(JSON.stringify(input))
  const hasNodeById = (id: string) => nodeStore.has(id)
  const getNodeById = (id: string) => nodeStore.get(id)

  return {
    createNode,
    createNodeId,
    createContentDigest,
    normalizeImageField,
    normalizeLinkField,
    normalizeSlicesField,
    normalizeStructuredTextField,
    typePaths,
    pluginOptions,
    context: { hasNodeById, getNodeById },
  }
}
