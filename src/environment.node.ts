import {
  Link as PrismicDOMLink,
  RichText as PrismicDOMRichText,
} from 'prismic-dom'
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
      const fullQualityUrl = new URL(field.url)
      // Remove auto parameter to download the original, full-quality image
      // from Imgix. Prismic automatically adds `auto=format,compress`, which,
      // when compounded with Sharp's compression, results in a doubly
      // compressed image.
      fullQualityUrl.searchParams.delete('auto')

      const fileNode = await createRemoteFileNode({
        url: fullQualityUrl.toString(),
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
  if (field && field.link_type === LinkFieldType.Document && field.id)
    linkedDocId = createNodeId(field.id)

  return {
    ...field,
    url: PrismicDOMLink.url(field, linkResolverForField),
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
