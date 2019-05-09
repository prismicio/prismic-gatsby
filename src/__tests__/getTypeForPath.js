import { getTypeForPath } from '../getTypeForPath'
import customTypeTypeDefs from './fixtures/customTypeTypeDefs.json'

describe.only('getTypeForPath', () => {
  test('returns type for a path', () => {
    const result = getTypeForPath(['data', 'title'], customTypeTypeDefs)

    expect(result)
  })
})
