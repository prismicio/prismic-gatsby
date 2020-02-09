import PrismicDOM from 'prismic-dom'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

import { msg } from './utils'

import { SourceNodesArgs } from 'gatsby'
import {
  DocumentsToNodesEnvironment,
  DocumentsToNodesEnvironmentNodeContext,
  HTMLSerializer,
  ImageFieldNormalizer,
  LinkFieldNormalizer,
  LinkFieldType,
  LinkResolver,
  NodeID,
  PluginOptions,
  SlicesFieldNormalizer,
  StructuredTextFieldNormalizer,
  TypePath,
} from './types'

const normalizeImageField: ImageFieldNormalizer = async (
  apiId,
  field,
  _path,
  doc,
  env,
) => {
  const { createNode, createNodeId, pluginOptions, context } = env
  const { gatsbyContext } = context as DocumentsToNodesEnvironmentNodeContext
  const { store, cache, actions, reporter } = gatsbyContext
  const { touchNode } = actions
  let { shouldDownloadImage } = pluginOptions

  let shouldAttemptToCreateRemoteFileNode = true
  if (shouldDownloadImage)
    shouldAttemptToCreateRemoteFileNode = await shouldDownloadImage({
      key: apiId,
      value: field,
      node: doc,
    })

  if (!shouldAttemptToCreateRemoteFileNode || !field.url) return field

  let fileNodeID: NodeID | undefined = undefined
  const cachedImageDataKey = `prismic-image-${field.url}`
  const cachedImageData: { fileNodeID: string } = await cache.get(
    cachedImageDataKey,
  )

  if (cachedImageData) {
    fileNodeID = cachedImageData.fileNodeID
    touchNode({ nodeId: fileNodeID })
  } else {
    try {
      const fileNode = await createRemoteFileNode({
        url: decodeURIComponent(field.url),
        store,
        cache,
        createNode,
        createNodeId,
        reporter,
      })

      if (fileNode) {
        fileNodeID = fileNode.id
        await cache.set(cachedImageDataKey, { fileNodeID })
      }
    } catch (error) {
      reporter.error(
        msg(`failed to create image node with URL: ${field.url}`),
        new Error(error),
      )
    }
  }

  return { ...field, localFile: fileNodeID }
}

const normalizeLinkField: LinkFieldNormalizer = (
  apiId,
  field,
  _path,
  doc,
  env,
) => {
  const { createNodeId, pluginOptions } = env
  const { linkResolver } = pluginOptions

  let linkResolverForField: LinkResolver | undefined = undefined
  if (linkResolver)
    linkResolverForField = linkResolver({
      key: apiId,
      value: field,
      node: doc,
    })

  let linkedDocId: NodeID | undefined = undefined
  if (field.link_type === LinkFieldType.Document)
    linkedDocId = createNodeId(`${field.type} ${field.id}`)

  return {
    ...field,
    url: PrismicDOM.Link.url(field, linkResolverForField),
    document: linkedDocId,
    raw: field,
  }
}

const normalizeSlicesField: SlicesFieldNormalizer = (
  _apiId,
  field,
  _path,
  _doc,
  _env,
) => field

const normalizeStructuredTextField: StructuredTextFieldNormalizer = (
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
  gatsbyContext: SourceNodesArgs,
  typePaths: TypePath[],
): DocumentsToNodesEnvironment => {
  const { actions, createNodeId, createContentDigest } = gatsbyContext
  const { createNode } = actions

  return {
    createNode,
    createNodeId: (input: string) => createNodeId(input),
    createContentDigest,
    normalizeImageField,
    normalizeLinkField,
    normalizeSlicesField,
    normalizeStructuredTextField,
    typePaths,
    pluginOptions,
    context: { gatsbyContext },
  }
}
