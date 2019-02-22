import util from 'util'
import * as R from 'ramda'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

import { customTypeJsonToGraphQLSchema } from './schema'
import { createNodeFactory, generateTypeName } from './nodeHelpers'

export const createTemporaryMockNodes = ({
  schemas,
  emitter,
  createNode,
  deleteNode,
}) => {
  const mockNodes = R.pipe(
    R.toPairs,
    R.reduce((acc, [type, jsonSchema]) => {
      const schema = customTypeJsonToGraphQLSchema(type, jsonSchema)
      const printedSchema = printSchema(schema)
      const mockedSchema = easygraphqlMock(printedSchema)
      const mockNode = createNodeFactory(type)(
        mockedSchema[generateTypeName(type)],
      )

      return R.concat(acc, [mockNode])
    }, []),
  )(schemas)

  mockNodes.forEach(x => createNode(x))

  const onSchemaUpdate = () => {
    mockNodes.forEach(node => deleteNode({ node }))

    // poor man's "once"
    emitter.off(`SET_SCHEMA`, onSchemaUpdate)
  }

  // we will listen to when schema is set,
  // so we can immediately remove mocked nodes
  // as types are already produced, we don't need them anymore
  // THIS IS HACKY - emitter is considered more of a private API
  // and listening to internal SET_SCHEMA message might be begging
  // for problems
  emitter.on(`SET_SCHEMA`, onSchemaUpdate)
}
