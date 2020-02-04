import { SourceNodesArgs } from 'gatsby'
import PrismicDOM from 'prismic-dom'
import {
  DocumentsToNodesEnvironment,
  SlicesFieldNormalizer,
  ImageFieldNormalizer,
  LinkFieldNormalizer,
  StructuredTextFieldNormalizer,
  LinkResolver,
  HTMLSerializer,
  LinkFieldType,
  NodeID,
  TypePath,
  PluginOptions,
} from './types'

const normalizeImageField: ImageFieldNormalizer = (
  _apiId,
  field,
  _path,
  _doc,
  _env,
) => {
  // TODO: Create File node and link to `localFile` field of return value.
  return field
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
    createNodeId: (input: unknown) => createNodeId(input),
    createContentDigest,
    normalizeImageField,
    normalizeLinkField,
    normalizeSlicesField,
    normalizeStructuredTextField,
    typePaths,
    pluginOptions,
  }
}
