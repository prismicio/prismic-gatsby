import util from 'util'
import * as R from 'ramda'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

import { customTypeJsonToGraphQLSchema } from './customTypeJsonToGraphQLSchema'
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

      // console.log(`================ ${type}`)
      // console.log(printedSchema)
      // console.log(util.inspect({ type, mockNode }, false, null, true))

      return R.concat(acc, [mockNode])
    }, []),
  )(schemas)

  mockNodes.forEach(node => {
    R.forEachObjIndexed((val, key) => {
      if (
        R.is(Array, val) &&
        (R.hasPath([0, 'primary'], val) || R.hasPath([0, 'items']))
      ) {
        const sliceChoiceNodes = R.map(
          sliceChoice =>
            createNodeFactory(sliceChoice.__typename.replace(/^Prismic/, ''))(
              sliceChoice,
            ),
          val,
        )

        sliceChoiceNodes.forEach(x => createNode(x))

        node.data[`${key}___NODE`] = R.map(R.prop('id'), sliceChoiceNodes)
      }
    }, node.data)

    createNode(node)
  })

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
