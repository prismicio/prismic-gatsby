import util from 'util'
import { parseSchema } from '../schema'
import schema from './fixtures/schema.json'

test('test', () => {
  const parsed = parseSchema(schema)
  console.log(util.inspect(parsed, false, null))
})
