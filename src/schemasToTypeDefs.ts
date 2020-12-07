import { msg, mapObjVals, isEmptyObj, buildSchemaTypeName } from './utils'

import {
  GatsbyGraphQLType,
  NodePluginSchema,
  CreateSchemaCustomizationArgs,
} from 'gatsby'
import {
  BaseFieldSchema,
  FieldSchema,
  FieldType,
  GraphQLType,
  GraphQLTypeObj,
  GroupFieldSchema,
  ImageFieldSchema,
  Schema,
  Schemas,
  SliceFieldSchema,
  SlicesFieldSchema,
  TypePath,
  SliceIDsField,
} from './types'

/**
 * Enqueues a GraphQL type definition to be created at a later time.
 *
 * @param typeDef GraphQL type definition.
 */
type EnqueueTypeDef = (typeDef: GatsbyGraphQLType) => void

/**
 * Enqueues a TypePath to the store.
 *
 * @param path Path to the field.
 * @param type GraphQL type identifier for the field.
 */
type EnqueueTypePath = (path: string[], type: GraphQLType | string) => void

interface SchemasToTypeDefsContext {
  customTypeApiId: string
  sliceZoneId?: string
  gatsbyContext: CreateSchemaCustomizationArgs
  enqueueTypeDef: EnqueueTypeDef
  enqueueTypePath: EnqueueTypePath
}

const fieldToType = (
  apiId: string,
  field: FieldSchema,
  path: string[],
  context: SchemasToTypeDefsContext,
): GraphQLTypeObj | GraphQLType | string => {
  const {
    customTypeApiId,
    enqueueTypeDef,
    enqueueTypePath,
    gatsbyContext,
    sliceZoneId,
  } = context
  const { schema: gatsbySchema, reporter } = gatsbyContext

  // Casting to `FieldType | string` since we may come across an unsupported
  // field type. This will happen when Prismic introduces new field types.
  switch (field.type as FieldType | string) {
    case FieldType.UID:
    case FieldType.Color:
    case FieldType.Select:
    case FieldType.Text: {
      const type = GraphQLType.String
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Boolean: {
      const type = GraphQLType.Boolean
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.StructuredText: {
      const type = GraphQLType.StructuredText
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Number: {
      const type = GraphQLType.Float
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Date:
    case FieldType.Timestamp: {
      const type = GraphQLType.Date
      enqueueTypePath([...path, apiId], type)
      return { type, extensions: { dateformat: {} } }
    }

    case FieldType.GeoPoint: {
      const type = GraphQLType.GeoPoint
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Embed: {
      const type = GraphQLType.Embed
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Image: {
      const type = GraphQLType.Image
      enqueueTypePath([...path, apiId], type)

      const thumbnails = (field as ImageFieldSchema)?.config?.thumbnails
      if (thumbnails)
        for (const thumbnail of thumbnails)
          enqueueTypePath(
            [...path, apiId, 'thumbnails', thumbnail.name],
            GraphQLType.ImageThumbnail,
          )

      return type
    }

    case FieldType.Link: {
      const type = GraphQLType.Link
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Group: {
      const groupTypeName = buildSchemaTypeName(
        `${customTypeApiId} ${apiId} GroupType`,
      )
      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: groupTypeName,
          fields: mapObjVals(
            (subfield, subfieldApiId) =>
              fieldToType(subfieldApiId, subfield, [...path, apiId], context),
            (field as GroupFieldSchema).config.fields,
          ) as { [key: string]: GraphQLType },
          extensions: { infer: false },
        }),
      )

      const type = `[${groupTypeName}]`
      enqueueTypePath([...path, apiId], type)
      return type
    }

    case FieldType.Slices: {
      const slicesTypeName = buildSchemaTypeName(
        `${customTypeApiId} ${apiId} SlicesType`,
      )
      const sliceChoices = (field as SlicesFieldSchema).config.choices
      const sliceChoiceTypes = Object.entries(sliceChoices).map(
        ([sliceChoiceApiId, sliceChoice]) =>
          fieldToType(sliceChoiceApiId, sliceChoice, [...path, apiId], {
            ...context,
            sliceZoneId: apiId,
          }),
      )

      enqueueTypeDef(
        gatsbySchema.buildUnionType({
          name: slicesTypeName,
          types: sliceChoiceTypes as string[],
        }),
      )

      const type = `[${slicesTypeName}]`
      enqueueTypePath([...path, apiId], type)
      return {
        type,
        resolve: (parent: SliceIDsField, _args: any, context: any, info: any) =>
          context.nodeModel.getNodesByIds({ ids: parent[info.path.key] }),
      }
    }

    case FieldType.Slice: {
      const {
        'non-repeat': primaryFields,
        repeat: itemsFields,
      } = field as SliceFieldSchema

      const sliceFieldTypes: { [key: string]: string } = {
        slice_type: `${GraphQLType.String}!`,
        slice_label: GraphQLType.String,
      }

      if (primaryFields && !isEmptyObj(primaryFields)) {
        const primaryTypeName = buildSchemaTypeName(
          `${customTypeApiId} ${sliceZoneId} ${apiId} PrimaryType`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: primaryTypeName,
            fields: mapObjVals(
              (primaryField, primaryFieldApiId) =>
                fieldToType(
                  primaryFieldApiId,
                  primaryField,
                  [...path, apiId, 'primary'],
                  context,
                ),
              primaryFields,
            ) as { [key: string]: GraphQLType },
          }),
        )

        enqueueTypePath([...path, apiId, 'primary'], primaryTypeName)
        sliceFieldTypes.primary = primaryTypeName
      }

      if (itemsFields && !isEmptyObj(itemsFields)) {
        const itemTypeName = buildSchemaTypeName(
          `${customTypeApiId} ${sliceZoneId} ${apiId} ItemType`,
        )

        enqueueTypeDef(
          gatsbySchema.buildObjectType({
            name: itemTypeName,
            fields: mapObjVals(
              (itemField, itemFieldApiId) =>
                fieldToType(
                  itemFieldApiId,
                  itemField,
                  [...path, apiId, 'items'],
                  context,
                ),
              itemsFields,
            ) as { [key: string]: GraphQLType },
          }),
        )

        const type = `[${itemTypeName}]`
        enqueueTypePath([...path, apiId, 'items'], type)
        sliceFieldTypes.items = type
      }

      const type = buildSchemaTypeName(
        `${customTypeApiId} ${sliceZoneId} ${apiId}`,
      )

      enqueueTypeDef(
        gatsbySchema.buildObjectType({
          name: type,
          fields: sliceFieldTypes,
          interfaces: ['PrismicSliceType', 'Node'],
          extensions: { infer: false },
        }),
      )

      enqueueTypePath([...path, apiId], type)
      return type
    }

    // Internal plugin-specific field not defined in the Prismic schema.
    case FieldType.AlternateLanguages: {
      // The types are intentionally different here. We need to handle
      // AlternateLanguages in a unique way in `documentToNodes.js`.
      enqueueTypePath([...path, apiId], FieldType.AlternateLanguages)
      return `[${GraphQLType.Link}!]!`
    }

    default: {
      const fieldPath = [...path, apiId].join('.')
      reporter.warn(
        msg(
          `Unsupported field type "${field.type}" detected for field "${fieldPath}". JSON type will be used.`,
        ),
      )

      const type = GraphQLType.JSON
      enqueueTypePath([...path, apiId], type)
      return type
    }
  }
}

const schemaToTypeDefs = (
  apiId: string,
  schema: Schema,
  context: SchemasToTypeDefsContext,
) => {
  const { enqueueTypeDef, enqueueTypePath, gatsbyContext } = context
  const { schema: gatsbySchema } = gatsbyContext

  // UID fields are defined at the same level as data fields, but are a level
  // above data in API responses. Pulling it out separately here allows us to
  // process the UID field differently than the data fields.
  const { uid: uidField, ...dataFields } = Object.values(schema).reduce(
    (acc, tab) => {
      for (const fieldApiId in tab) acc[fieldApiId] = tab[fieldApiId]
      return acc
    },
    {},
  )

  // UID fields must be conditionally processed since not all custom types
  // implement a UID field.
  let uidFieldType: string | undefined
  if (uidField)
    uidFieldType = fieldToType('uid', uidField, [apiId], context) as string

  // The alternate languages field acts as a list of Link fields. Note:
  // AlternateLanguages is an internal plugin-specific type, not from Prismic.
  const alternateLanguagesFieldType = fieldToType(
    'alternate_languages',
    { type: FieldType.AlternateLanguages } as BaseFieldSchema,
    [apiId],
    context,
  )

  // Create a type for all data fields.
  const dataTypeName = buildSchemaTypeName(`${apiId} DataType`)
  enqueueTypePath([apiId, 'data'], dataTypeName)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: dataTypeName,
      fields: mapObjVals(
        (dataField, dataFieldApiId) =>
          fieldToType(dataFieldApiId, dataField, [apiId, 'data'], context),
        dataFields,
      ) as { [key: string]: GraphQLType },
      extensions: { infer: false },
    }),
  )

  // Create the main schema type.
  const schemaTypeName = buildSchemaTypeName(apiId)
  const schemaFieldTypes: {
    [key: string]: GraphQLTypeObj | GraphQLType | string
  } = {
    data: dataTypeName,
    dataRaw: `${GraphQLType.JSON}!`,
    dataString: `${GraphQLType.String}!`,
    first_publication_date: {
      type: `${GraphQLType.Date}!`,
      extensions: { dateformat: {} },
    },
    href: `${GraphQLType.String}!`,
    url: GraphQLType.String,
    lang: `${GraphQLType.String}!`,
    last_publication_date: {
      type: `${GraphQLType.Date}!`,
      extensions: { dateformat: {} },
    },
    tags: `[${GraphQLType.String}!]!`,
    alternate_languages: alternateLanguagesFieldType as string,
    type: `${GraphQLType.String}!`,
    prismicId: `${GraphQLType.ID}!`,
    _previewable: `${GraphQLType.ID}!`,
  }
  if (uidFieldType) schemaFieldTypes.uid = uidFieldType

  enqueueTypePath([apiId], schemaTypeName)
  enqueueTypeDef(
    gatsbySchema.buildObjectType({
      name: schemaTypeName,
      fields: schemaFieldTypes as { [key: string]: GraphQLType },
      interfaces: ['PrismicDocument', 'Node'],
      extensions: { infer: false },
    }),
  )
}

/**
 * Returns an GraphQL type containing all image thumbnail field names. If no thumbnails are configured, a placeholder type is returned.
 *
 * @param typePaths Array of TypePaths for all schemas.
 * @param gatsbySchema Gatsby node schema.
 *
 * @returns GraphQL type to support image thumbnail fields.
 */
const buildImageThumbnailsType = (
  typePaths: TypePath[],
  gatsbySchema: NodePluginSchema,
) => {
  const keys = typePaths
    .filter((typePath) => typePath.type === GraphQLType.ImageThumbnail)
    .map((typePath) => typePath.path[typePath.path.length - 1])

  if (keys.length < 1)
    return gatsbySchema.buildScalarType({
      name: GraphQLType.ImageThumbnails,
      serialize: () => null,
    })

  const fieldTypes = keys.reduce((acc, key) => {
    acc[key] = GraphQLType.ImageThumbnail
    return acc
  }, {} as { [key: string]: GraphQLType.ImageThumbnail })

  return gatsbySchema.buildObjectType({
    name: GraphQLType.ImageThumbnails,
    fields: fieldTypes,
  })
}

/**
 * Converts an object mapping custom type API IDs to JSON schemas to an array
 * of GraphQL type definitions. The result is intended to be called with
 * Gatsby's `createTypes` action.
 *
 * @param schemas An object mapping custom type API IDs to JSON schemas.
 *
 * @returns An array of GraphQL type definitions.
 */
export const schemasToTypeDefs = (
  schemas: Schemas,
  gatsbyContext: CreateSchemaCustomizationArgs,
) => {
  const { schema: gatsbySchema } = gatsbyContext

  const typeDefs: GatsbyGraphQLType[] = []
  const enqueueTypeDef: EnqueueTypeDef = (typeDef) =>
    void typeDefs.push(typeDef)

  const typePaths: TypePath[] = []
  const enqueueTypePath: EnqueueTypePath = (path, type) =>
    void typePaths.push({ path, type })

  const context = { gatsbyContext, enqueueTypeDef, enqueueTypePath }

  for (const apiId in schemas)
    schemaToTypeDefs(apiId, schemas[apiId], {
      ...context,
      customTypeApiId: apiId,
    })

  // Union type for all schemas.
  enqueueTypeDef(
    gatsbySchema.buildUnionType({
      name: GraphQLType.AllDocumentTypes,
      types: Object.keys(schemas).map((apiId) => buildSchemaTypeName(apiId)),
    }),
  )

  // Type for all image thumbnail fields.
  enqueueTypeDef(buildImageThumbnailsType(typePaths, gatsbySchema))

  return { typeDefs, typePaths }
}
