import util from 'util'
import { customTypeJsonToGraphQLSchema } from '../customTypeJsonToGraphQLSchema'
import customTypeJson from './fixtures/schema.json'
import schemaExperimental from './fixtures/schemaExperimental.json'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

test('parse schema from provided JSON', () => {
  const schema = customTypeJsonToGraphQLSchema('page', customTypeJson)
  const printedSchema = printSchema(schema)

  const mockedSchema = easygraphqlMock(printedSchema)

  // console.log(printedSchema)

  // console.log(util.inspect(printedSchema, false, null, true))
})
