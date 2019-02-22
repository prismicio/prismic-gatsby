import util from 'util'
import { customTypeJsonToGraphQLSchema } from '../schema'
import { parseSchema as parseSchemaExperimental } from '../schemaExperimental'
import customTypeJson from './fixtures/schema.json'
import schemaExperimental from './fixtures/schemaExperimental.json'
import { printSchema } from 'gatsby/graphql'
import easygraphqlMock from 'easygraphql-mock'

test('parse schema from provided JSON', () => {
  const schema = customTypeJsonToGraphQLSchema('page', customTypeJson)
  const printedSchema = printSchema(schema)

  const mockedSchema = easygraphqlMock(printedSchema)

  // console.log(printedSchema)

  console.log(util.inspect(mockedSchema, false, null, true))
})

test.skip('parse schema from experiemental endpoint', () => {
  // Schema from https://<repository-name>.prismic.io/apibrowser/types?ref=<ref>
  const parsed = parseSchemaExperimental(schemaExperimental)
  console.log(util.inspect(parsed, false, null))
})
