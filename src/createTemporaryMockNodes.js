import * as R from 'ramda'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

import { customTypeJsonToGraphQLSchema } from './customTypeJsonToGraphQLSchema'
import { createNodeFactory, generateTypeName } from './nodeHelpers'
import { isSliceField } from './normalize'

// Mock date to allow Gatsby to apply Date arguments
const MOCK_DATE = '1991-03-07'

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
const createTemporaryAccessoryMockNodes = ({ node, createNode }) => {
  let createdMockNodes = []

  R.forEach((val, key) => {
    // If field is a slice field, create slice nodes and create references.
    if (isSliceField(value)) {
      const sliceChoiceNodes = R.map(
        sliceChoice =>
          createNodeFactory(sliceChoice.__typename.replace(/^Prismic/, ''))(
            sliceChoice,
          ),
        value,
      )

      // Create all choice nodes, set as a union field, and delete the original key.
      sliceChoiceNodes.forEach(x => createNode(x))
      node.data[`${key}___NODE`] = R.map(R.prop('id'), sliceChoiceNodes)
      delete node.data[key]

      createdMockNodes = sliceChoiceNodes
    }
  }, node.data)

  return createdMockNodes
}

// Creates and deletes temporary mock nodes from the provided custom type JSON
// schemas.
//
// This function sets up an emitter listener to automatically remove the mock
// nodes once they are unnecessary
export const createTemporaryMockNodes = ({
  schemas,
  emitter,
  createNode,
  deleteNode,
}) => {
  // As nodes are created, they will be appended here for deletion later.
  let createdMockNodes = []

  // Create mock nodes from an object mapping a type name to a custom type JSON schema.
  R.pipe(
    // 1. Convert the schemas to mock nodes.
    R.toPairs,
    R.reduce(
      (acc, [type, jsonSchema]) =>
        R.concat(acc, [jsonSchemaToMockNode(type, jsonSchema)]),
      [],
    ),

    // 2. Create the mock nodes and any necessary accessory mock nodes.
    // Accessory mock nodes are necessary anywhere "___NODE" fields are used in
    // the source plugin, such as Slice and Link fields.
    //
    // Return a list of nodes created.
    //
    // NOTE: This map function has side-effects!
    R.map(mockNode => {
      // Side-effect! This creates nodes.
      const temporaryAccessoryMockNodes = createTemporaryAccessoryMockNodes({
        node: mockNode,
        createNode,
      })

      createNode(mockNode)

      return [mockNode, temporaryAccessoryMockNodes]
    }),

    // 3. Set createdMockNodes with the list of nodes to delete later.
    R.flatten,
    nodes => (createdMockNodes = nodes),
  )(schemas)

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
