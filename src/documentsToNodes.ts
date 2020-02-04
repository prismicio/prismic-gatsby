import PrismicDOM from 'prismic-dom'
import pascalcase from 'pascalcase'
import { Document as PrismicDocument } from 'prismic-javascript/d.ts/documents'
import {
  DocumentsToNodesEnvironment,
  TypePath,
  GraphQLType,
  StructuredTextField,
  LinkField,
  AlternateLanguagesField,
  LinkFieldType,
  LinkResolver,
  DocumentNodeInput,
  GroupField,
  SlicesField,
  SliceNodeInput,
  Field,
  NormalizedField,
  NormalizedAlternateLanguagesField,
} from './types'
import { mapObjVals, buildSchemaTypeName } from './utils'

const getTypeForPath = (
  path: TypePath['path'],
  typePaths: TypePath[],
): GraphQLType | string | undefined => {
  const stringifiedPath = JSON.stringify(path)
  const def = typePaths.find(x => JSON.stringify(x.path) === stringifiedPath)

  if (!def) return
  if (/^\[.*GroupType\]$/.test(def.type)) return GraphQLType.Group
  if (/^\[.*SlicesType\]$/.test(def.type)) return GraphQLType.Slices

  return def.type
}

const normalizeField = (
  apiId: string,
  field: Field,
  path: TypePath['path'],
  doc: PrismicDocument,
  env: DocumentsToNodesEnvironment,
): NormalizedField => {
  const {
    createNodeId,
    createNode,
    createContentDigest,
    typePaths,
    normalizeStructuredTextField,
    normalizeLinkField,
    normalizeImageField,
    normalizeSlicesField,
  } = env

  const type = getTypeForPath([...path, apiId], typePaths)

  switch (type) {
    case GraphQLType.Image: {
      // TODO
    }

    case GraphQLType.StructuredText: {
      return normalizeStructuredTextField(
        apiId,
        field as StructuredTextField,
        path,
        doc,
        env,
      )
    }

    case GraphQLType.Link: {
      return normalizeLinkField(apiId, field as LinkField, path, doc, env)
    }

    case GraphQLType.Group: {
      return normalizeObjs(field as GroupField, [...path, apiId], doc, env)
    }

    case GraphQLType.Slices: {
      const sliceNodeIds = (field as SlicesField).map((slice, index) => {
        const sliceNodeId = createNodeId(
          `${doc.type} ${doc.id} ${apiId} ${index}`,
        )

        const normalizedPrimary = normalizeObj(
          slice.primary,
          [...path, apiId, slice.slice_type, 'primary'],
          doc,
          env,
        )

        const normalizedItems = normalizeObjs(
          slice.items,
          [...path, apiId, slice.slice_type, 'items'],
          doc,
          env,
        )

        const node: SliceNodeInput = {
          id: sliceNodeId,
          primary: normalizedPrimary,
          items: normalizedItems,
          internal: {
            type: pascalcase(
              `Prismic ${doc.type} ${apiId} ${slice.slice_type}`,
            ),
            contentDigest: createContentDigest(slice),
          },
        }

        createNode(node)

        return node.id
      })

      return normalizeSlicesField(
        apiId,
        sliceNodeIds,
        [...path, apiId],
        doc,
        env,
      )
    }

    // This field type is not an actual Prismic type and was assigned manually
    // in `schemasToTypeDefs.ts`.
    case GraphQLType.AlternateLanguages: {
      // Treat the array of alternate language documents as a list of link
      // fields. We need to force the link type to a Document since it is not
      // there by default.
      return (field as AlternateLanguagesField).map(item =>
        normalizeLinkField(
          apiId,
          {
            ...item,
            link_type: LinkFieldType.Document,
          },
          path,
          doc,
          env,
        ),
      )
    }

    default: {
      return field
    }
  }
}

const normalizeObj = (
  obj: { [key: string]: Field } = {},
  path: TypePath['path'],
  doc: PrismicDocument,
  env: DocumentsToNodesEnvironment,
): { [key: string]: NormalizedField } =>
  mapObjVals(
    (field, fieldApiId) => normalizeField(fieldApiId, field, path, doc, env),
    obj,
  )

const normalizeObjs = (
  objs: { [key: string]: Field }[] = [],
  path: TypePath['path'],
  doc: PrismicDocument,
  env: DocumentsToNodesEnvironment,
) => objs.map(obj => normalizeObj(obj, path, doc, env))

const documentToNodes = (
  doc: PrismicDocument,
  env: DocumentsToNodesEnvironment,
) => {
  const { createNode, createContentDigest, createNodeId, pluginOptions } = env
  const { linkResolver } = pluginOptions

  let linkResolverForDoc: LinkResolver | undefined = undefined
  if (linkResolver) linkResolverForDoc = linkResolver({ node: doc })

  const docNodeId = createNodeId(`${doc.type} ${doc.id}`)
  const docUrl = PrismicDOM.Link.url(doc, linkResolverForDoc)

  const normalizedData = normalizeObj(doc.data, [doc.type, 'data'], doc, env)
  const normalizedAlernativeLanguages = normalizeField(
    'alternate_languages',
    (doc.alternate_languages as unknown) as AlternateLanguagesField,
    [doc.type],
    doc,
    env,
  ) as NormalizedAlternateLanguagesField

  const node: DocumentNodeInput = {
    ...doc,
    id: docNodeId,
    prismicId: doc.id,
    data: normalizedData,
    dataString: JSON.stringify(doc.data),
    dataRaw: doc.data,
    alternate_languages: normalizedAlernativeLanguages,
    url: docUrl,
    internal: {
      type: buildSchemaTypeName(doc.type),
      contentDigest: createContentDigest(doc),
    },
  }

  createNode(node)
}

export const documentsToNodes = (
  docs: PrismicDocument[],
  env: DocumentsToNodesEnvironment,
) => {
  for (const doc of docs) documentToNodes(doc, env)
}
