import * as R from 'ramda'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

import { customTypeJsonToGraphQLSchema } from './customTypeJsonToGraphQLSchema'
import { createNodeFactory, generateTypeName } from './nodeHelpers'
import { isSliceField } from './normalize'

// Mock date to allow Gatsby to apply Date arguments
const MOCK_DATE = '1991-03-07'

// Returns a copy of an object with a given prop removed at all levels.
const removePropDeep = R.curry((prop, obj) =>
  JSON.parse(JSON.stringify(obj, (k, v) => (k === prop ? undefined : v))),
)

// Returns a mock Gatsby Node for the given type and custom type JSON schema.
const jsonSchemaToMockNode = (type, jsonSchema) => {
  // Convert the JSON schema to a collection of mock objects.
  const schema = customTypeJsonToGraphQLSchema(type, jsonSchema)
  const printedSchema = printSchema(schema)
  const mockedSchema = easygraphqlMock(printedSchema, {
    Date: MOCK_DATE,
  })

  // mockedSchema contains mocks for every subtype, but we only need the main
  // root mock node.
  const rootMockedNode = mockedSchema[generateTypeName(type)]

  const MockNode = createNodeFactory(type)

  return MockNode(rootMockedNode)
}

// Creates accessory nodes and mutates original node as necessary. Returns an
// array of nodes that were created.
const createTemporaryAccessoryMockNodes = async (node, createNode) => {
  const promises = R.pipe(
    R.toPairs,
    R.map(async ([key, value]) => {
      if (isSliceField(value)) {
        const sliceChoiceNodes = R.map(
          sliceChoice =>
            createNodeFactory(sliceChoice.__typename.replace(/^Prismic/, ''))(
              sliceChoice,
            ),
          value,
        )

        // Create all choice nodes, set as a union field, and delete the original key.
        sliceChoiceNodes.forEach(x =>
          createNode(removePropDeep('__typename', x)),
        )
        node.data[`${key}___NODE`] = R.map(R.prop('id'), sliceChoiceNodes)
        delete node.data[key]

        return sliceChoiceNodes
      }

      if (isImageField(value)) {
        // Use createRemoteFileNode to create accessory node.
      }

      if (isLinkField(value)) {
        // Create instances of each content type and link to document___NODE field.
      }

      return []
    }),
  )(node)

  return await Promise.all(promises)
}

// Creates and deletes temporary mock nodes from the provided custom type JSON
// schemas.
//
// This function sets up an emitter listener to automatically remove the mock
// nodes once they are unnecessary
export const createTemporaryMockNodes = async ({
  schemas,
  emitter,
  createNode,
  deleteNode,
}) => {
  // 1. Convert the schemas to mock nodes.
  const mockNodes = R.pipe(
    R.toPairs,
    R.map(([type, jsonSchema]) => jsonSchemaToMockNode(type, jsonSchema)),
  )(schemas)

  // 2. Create the mock nodes and any necessary accessory mock nodes.
  //    Accessory mock nodes are necessary anywhere "___NODE" fields are used
  //    in the source plugin, such as Slice and Link fields.
  const promises = R.map(async mockNode => {
    const temporaryAccessoryMockNodes = await createTemporaryAccessoryMockNodes(
      mockNode,
      createNode,
    )

    createNode(removePropDeep('__typename', mockNode))

    return [mockNode, ...temporaryAccessoryMockNodes]
  }, mockNodes)

  // 3. Set createdMockNodes with the list of nodes to delete later.
  const createdMockNodesSegmented = await Promise.all(promises)
  const createdMockNodes = R.flatten(createdMockNodesSegmented)

  // Performed once the schema has been set so we can delete all temporary mock nodes.
  const onSchemaUpdate = () => {
    createdMockNodes.forEach(node => deleteNode({ node }))

    // Only perform this action once
    emitter.off(`SET_SCHEMA`, onSchemaUpdate)
  }

  // We will listen to when the schema is set so we can immediately remove the
  // mocked nodes. At this point, the types are already produced, rendering the
  // mock nodes unnecessary.
  //
  // THIS IS HACKY! emitter is considered more of a private API and listening
  // to internal the SET_SCHEMA message might be begging for problems.
  emitter.on(`SET_SCHEMA`, onSchemaUpdate)
}
