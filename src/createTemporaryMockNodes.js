import * as R from 'ramda'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'
import { createRemoteFileNode } from 'gatsby-source-filesystem'

import { customTypeJsonToGraphQLSchema } from './customTypeJsonToGraphQLSchema'
import { createNodeFactory, generateTypeName } from './nodeHelpers'
import {
  isGroupField,
  isImageField,
  isLinkField,
  isSliceField,
} from './normalize'

// Mock date to allow Gatsby to apply Date arguments
const MOCK_DATE = '1991-03-07'

// Mock image URL to download via createRemoteFileNode
const MOCK_IMAGE_URL = 'https://prismic.io/...2f6802b/images/favicon.png'

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
    ImageURL: MOCK_IMAGE_URL,
  })

  // mockedSchema contains mocks for every subtype, but we only need the main
  // root mock node.
  const rootMockedNode = mockedSchema[generateTypeName(type)]

  const MockNode = createNodeFactory(type)

  return MockNode(rootMockedNode)
}

// Normalizes a mock image field by providing a `localFile` field using
// `gatsby-source-filesystem`. This allows for `gatsby-transformer-sharp` and
// `gatsby-image` integration. Creates one File node.
const normalizeMockImageField = async args => {
  const { value, gatsbyContext } = args
  const {
    actions: { createNode },
    createNodeId,
    store,
    cache,
  } = gatsbyContext

  const url = decodeURIComponent(value.url)

  const fileNode = await createRemoteFileNode({
    url,
    store,
    cache,
    createNode,
    createNodeId,
  })

  value.localFile___NODE = fileNode.id

  // TODO: Resolve `children` error when fileNode is deleted with `deleteNodes`
  // later in the process.
  // return [fileNode]

  return []
}

// Normalizes a mock link field by providing a `document` field with a union
// type containing all custom types. The node references use the existing mock
// nodes. Creates no additional nodes.
const normalizeMockLinkField = async args => {
  const { value, rootNodes } = args

  value.document___NODE = R.map(R.prop('id'), rootNodes)

  return []
}

// Normalizes a slice zone field by recursively normalizing `item` and
// `primary` keys and returns a list of created nodes. It creates a node for
// each slice type to ensure the slice key can handle multiple (i.e. union)
// types.
const normalizeMockSliceField = async args => {
  const { key, value, node, createNodeWithoutTypename } = args

  const promises = R.map(async sliceChoiceNode => {
    const itemNodes = await normalizeMockGroupField({
      ...args,
      value: sliceChoiceNode.items,
    })

    const primaryNodes = await normalizeMockFields({
      ...args,
      value: sliceChoiceNode.primary,
    })

    const typename = sliceChoiceNode.__typename.replace(/^Prismic/, '')
    const gatsbySliceChoiceNode = createNodeFactory(typename)(sliceChoiceNode)

    createNodeWithoutTypename(gatsbySliceChoiceNode)

    return [gatsbySliceChoiceNode, ...itemNodes, ...primaryNodes]
  }, value)

  value[`${key}___NODE`] = R.map(R.prop('id'), value)
  delete value[key]

  const createdMockNodesSegmented = await Promise.all(promises)
  const createdMockNodes = R.flatten(createdMockNodesSegmented)

  return createdMockNodes
}

// Normalizes a mock group field by recursively normalizing each entry's field
// and returns a list of created nodes.
const normalizeMockGroupField = async args => {
  const { value } = args

  const promises = R.pipe(
    R.toPairs,
    R.map(
      async ([fieldKey, fieldValue]) =>
        await normalizeMockFields({
          ...args,
          key: fieldKey,
          value: fieldValue,
        }),
    ),
  )(value)

  const createdMockNodesSegmented = await Promise.all(promises)
  const createdMockNodes = R.flatten(createdMockNodesSegmented)

  return createdMockNodes
}

// Normalizes a mock field by determining its type and returns a list of
// created nodes. If the type is not supported or needs no normalizing, an
// empty list is returned.
const normalizeMockField = async args => {
  const { key, value } = args

  if (isLinkField(value)) return await normalizeMockLinkField(args)
  if (isImageField(value)) return await normalizeMockImageField(args)
  if (isSliceField(value)) return await normalizeMockSliceField(args)
  if (isGroupField(value)) return await normalizeMockGroupField(args)

  return []
}

// Normalizes an object of mock fields and returns a list of created nodes.
const normalizeMockFields = async args => {
  const { value } = args

  const promises = R.pipe(
    R.toPairs,
    R.map(
      async ([key, value]) => await normalizeMockField({ ...args, key, value }),
    ),
  )(value)

  const createdMockNodesSegmented = await Promise.all(promises)
  const createdMockNodes = R.flatten(createdMockNodesSegmented)

  return createdMockNodes
}

// Normalizes a mock node's data fields and returns a list of created nodes.
const normalizeMockNode = async args => {
  const { node } = args

  return await normalizeMockFields({ ...args, value: node.data })
}

// Creates and deletes temporary mock nodes from the provided custom type JSON
// schemas.
//
// This function sets up an emitter listener to automatically remove the mock
// nodes once they are unnecessary
export const createTemporaryMockNodes = async ({ schemas, gatsbyContext }) => {
  const {
    actions: { createNode, deleteNode },
    emitter,
  } = gatsbyContext

  // createNode function without typename injected from
  // customTypeJsonToGraphQLSchema.
  const createNodeWithoutTypename = node =>
    createNode(removePropDeep('__typename', node))

  // 1. Convert the schemas to mock nodes.
  const mockNodes = R.pipe(
    R.toPairs,
    R.map(([type, jsonSchema]) => jsonSchemaToMockNode(type, jsonSchema)),
  )(schemas)

  // 2. Create the mock nodes and any necessary accessory mock nodes.
  //    Accessory mock nodes are necessary anywhere "___NODE" fields are used
  //    in the source plugin, such as Slice and Link fields.
  const promises = R.map(async mockNode => {
    const createdMockNodes = await normalizeMockNode({
      node: mockNode,
      rootNodes: mockNodes,
      createNodeWithoutTypename,
      gatsbyContext,
    })

    createNodeWithoutTypename(mockNode)

    return [mockNode, ...createdMockNodes]
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
