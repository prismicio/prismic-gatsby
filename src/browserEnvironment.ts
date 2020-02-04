import { NodeInput } from 'gatsby'
import PrismicDOM from 'prismic-dom'
import uuidv5 from 'uuid/v5'
import md5 from 'md5'
import { buildFixedGatsbyImage, buildFluidGatsbyImage } from './gatsbyImage'
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

const UUID_NAMESPACE = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`

// TODO: Implement browser environment. The following was mostly copy/pasted
// from the node environment.

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
  }
}
