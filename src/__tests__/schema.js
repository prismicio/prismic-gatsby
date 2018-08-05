import util from 'util'
import { parseSchema } from '../schema'
import { parseSchema as parseSchemaExperimental } from '../schemaExperimental'
import schema from './fixtures/schema.json'
import schemaExperimental from './fixtures/schemaExperimental.json'

test('parse schema from provided JSON', () => {
  const parsed = parseSchema(schema)
  console.log(util.inspect(parsed, false, null))
})

test('parse schema from experiemental endpoint', () => {
  // Schema from https://<repository-name>.prismic.io/apibrowser/types?ref=<ref>
  const parsed = parseSchemaExperimental(schemaExperimental)
  console.log(util.inspect(parsed, false, null))
})
