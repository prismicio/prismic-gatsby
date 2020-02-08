import { NodeInput } from 'gatsby'
import PrismicDOM from 'prismic-dom'
import uuidv5 from 'uuid/v5'
import md5 from 'md5'
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi'
import { buildFixedGatsbyImage, buildFluidGatsbyImage } from './gatsbyImage'
import { createClient } from './api'
import { documentToNodes } from './documentsToNodes'
import {
  DocumentsToNodesEnvironment,
  DocumentsToNodesEnvironmentBrowserContext,
  SlicesFieldNormalizer,
  ImageFieldNormalizer,
  LinkFieldNormalizer,
  StructuredTextFieldNormalizer,
  LinkResolver,
  HTMLSerializer,
  LinkFieldType,
  TypePath,
  PluginOptions,
  LinkField,
  NormalizedLinkField,
} from './types'
import { buildSchemaTypeName } from 'utils'

interface UnbrokenDocumentLinkField extends LinkField {
  link_type: LinkFieldType.Document
  id: string
  isBroken: false
}

const UUID_NAMESPACE = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`
const PLACEHOLDER_NODE_TYPE_SUFFIX = '___PLACEHOLDER'

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

  const linkedDocId = createNodeId(`${field.type} ${field.id}`)

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
  _env,
) => {
  const url = field.url

  if (!url) return field

  const fixed = buildFixedGatsbyImage(
    url,
    field.dimensions!.width,
    field.dimensions!.width,
  )

  const fluid = buildFluidGatsbyImage(
    url,
    field.dimensions!.width,
    field.dimensions!.width,
  )

  return { ...field, fixed, fluid }
}

// TODO: Abstract proxy handler for any `getNodeById` needs (e.g. Slices).
const normalizeLinkField: LinkFieldNormalizer = (
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
  const linkedDocId = createNodeId(`${field.type} ${field.id}`)

  if (field.link_type === LinkFieldType.Document && field.id && !field.isBroken)
    loadLinkFieldDocument(field as UnbrokenDocumentLinkField, env)

  return new Proxy(
    {
      ...field,
      url: PrismicDOM.Link.url(field, linkResolverForField),
      document: linkedDocId,
      raw: field,
    },
    {
      get: (obj, prop: keyof NormalizedLinkField) => {
        if (prop === 'document') {
          if (
            field.link_type === LinkFieldType.Document &&
            field.id &&
            !field.isBroken
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
    html: PrismicDOM.RichText.asHtml(
      field,
      linkResolverForField,
      htmlSerializerForField,
    ),
    text: PrismicDOM.RichText.asText(field),
    raw: field,
  }
}

export const createEnvironment = (
  pluginOptions: PluginOptions,
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
