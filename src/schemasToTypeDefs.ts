import { SourceNodesArgs, GatsbyGraphQLType } from 'gatsby'
import { Schemas, Schema, TypePath, Field } from './types'

type EnqueueTypeDef = (typeDef: GatsbyGraphQLType) => void
type EnqueueTypePath = (path: string[], type: string) => void

interface SchemasToTypeDefsContext {
  customTypeApiId: string
  gatsbyContext: SourceNodesArgs
  enqueueTypeDef: EnqueueTypeDef
  enqueueTypePath: EnqueueTypePath
}

const fieldToType = (
  apiId: string,
  field: Field,
  path: string[],
  context: SchemasToTypeDefsContext,
) => {}

const schemaToTypeDefs = (
  apiId: string,
  schema: Schema,
  context: SchemasToTypeDefsContext,
) => {
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

  let uidFieldType
  if (uidField) uidFieldType = fieldToType('uid', uidField, [apiId], context)

  return
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
  gatsbyContext: SourceNodesArgs,
) => {
  const typeDefs = []
  const enqueueTypeDef: EnqueueTypeDef = typeDef => typeDefs.push(typeDef)

  const typePaths: TypePath[] = []
  const enqueueTypePath: EnqueueTypePath = (path, type) =>
    typePaths.push({ path, type })

  const context = { gatsbyContext, enqueueTypeDef, enqueueTypePath }

  for (const apiId in schemas)
    typeDefs.push(
      schemaToTypeDefs(apiId, schemas[apiId], {
        ...context,
        customTypeApiId: apiId,
      }),
    )

  return typeDefs
}
