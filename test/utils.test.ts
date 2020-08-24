import { buildSchemaTypeName } from '../src/utils'

describe('buildSchemaTypeName', () => {
  test('correctly formats an API ID to a GraphQL type name', () => {
    expect(buildSchemaTypeName('type')).toBe('PrismicType')
    expect(buildSchemaTypeName('type-1')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type_1')).toBe('PrismicType1')
    expect(buildSchemaTypeName('type1')).toBe('PrismicType1')
  })
})
